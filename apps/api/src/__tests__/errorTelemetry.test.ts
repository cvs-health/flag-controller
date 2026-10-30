// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fastifyOtel from '@fastify/otel';
import { SpanKind } from '@opentelemetry/api';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import Fastify from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';

import { InternalError, NotFoundError } from '../errors/AppError.js';
import { handleNotFound, handleRouteError } from '../utils/errorHandler.js';

async function buildApp(exporter: InMemorySpanExporter) {
  const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
  const instrumentation = new fastifyOtel.FastifyOtelInstrumentation({ recordExceptions: false });
  instrumentation.setTracerProvider(provider);

  const app = Fastify();
  app.setErrorHandler(handleRouteError);
  app.setNotFoundHandler(handleNotFound);
  await app.register(instrumentation.plugin());

  app.get('/not-found', async () => {
    throw new NotFoundError({ message: 'flag abc missing from table feature_flags' });
  });
  app.get('/internal', async () => {
    throw new InternalError({ message: 'db down' });
  });
  app.get('/unexpected', async () => {
    throw new Error('kaboom');
  });

  await app.ready();

  return app;
}

function requestSpan(exporter: InMemorySpanExporter) {
  const [span, ...rest] = exporter.getFinishedSpans().filter((candidate) => candidate.kind === SpanKind.SERVER);

  if (!span || rest.length > 0) {
    throw new Error('expected exactly one server span');
  }

  return span;
}

function exceptionEvents(exporter: InMemorySpanExporter) {
  return exporter.getFinishedSpans().flatMap((span) => span.events.filter((event) => event.name === 'exception'));
}

describe('error telemetry', () => {
  let exporter: InMemorySpanExporter;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    exporter = new InMemorySpanExporter();
    app = await buildApp(exporter);
  });

  // Needs both the `status < 500` return in recordOnSpan and `recordExceptions: false` on the plugin.
  // Either one alone leaves 4xx recording exceptions, which buries real faults under scanner traffic.
  it.each([
    ['an expected 4xx', '/not-found', 0, undefined],
    ['an explicit 5xx', '/internal', 1, 'INTERNAL'],
    ['an unexpected 5xx', '/unexpected', 1, 'INTERNAL'],
  ])('%s records %i exception with error.type %s', async (_name, url, events, errorType) => {
    await app.inject({ method: 'GET', url });

    expect(exceptionEvents(exporter)).toHaveLength(events);
    expect(requestSpan(exporter).attributes['error.type']).toBe(errorType);
  });

  // handleNotFound replies rather than throwing
  it('records nothing for an unmatched route', async () => {
    await app.inject({ method: 'GET', url: '/nope' });

    expect(exceptionEvents(exporter)).toHaveLength(0);
    expect(requestSpan(exporter).attributes['error.type']).toBeUndefined();
  });

  // The plugin's onError hook writes the raw error.message into span status. That field is what a
  // trace backend groups on, so recordOnSpan replaces it with the low-cardinality code.
  it('sets a 4xx span status message to the code, not the raw message', async () => {
    await app.inject({ method: 'GET', url: '/not-found' });

    expect(requestSpan(exporter).status.message).toBe('NOT_FOUND');
  });

  // 4xx above is the only status we own this field for: the plugin's onSend hook re-sets status
  // without a message for anything >= 500, after the error handler has run. Grouping for 5xx comes
  // from the error.type attribute instead, which survives.
  it.each(['/internal', '/unexpected'])('leaves a 5xx span status message to the plugin (%s)', async (url) => {
    await app.inject({ method: 'GET', url });

    expect(requestSpan(exporter).status.message).toBeUndefined();
  });

  it('records the original error rather than the sanitized problem', async () => {
    await app.inject({ method: 'GET', url: '/unexpected' });

    expect(exceptionEvents(exporter)[0]?.attributes?.['exception.message']).toBe('kaboom');
  });

  it('does not require the plugin to be registered', async () => {
    const bare = Fastify();
    bare.setErrorHandler(handleRouteError);
    bare.get('/boom', async () => {
      throw new Error('kaboom');
    });

    const response = await bare.inject({ method: 'GET', url: '/boom' });

    expect(response.statusCode).toBe(500);
  });
});
