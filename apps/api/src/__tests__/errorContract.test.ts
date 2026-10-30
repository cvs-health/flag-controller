// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import Fastify from 'fastify';
import { ErrorCode, PROBLEM_CONTENT_TYPE } from 'shared-types';
import { describe, expect, it } from 'vitest';

import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableError,
} from '../errors/AppError.js';
import { problemSchema } from '../schemas/responses.js';
import { handleNotFound, handleRouteError } from '../utils/errorHandler.js';

// Routes declare problemSchema so this also proves the serializer does not strip problem fields.
function buildApp() {
  const app = Fastify({ bodyLimit: 64 });

  app.setErrorHandler(handleRouteError);
  app.setNotFoundHandler(handleNotFound);

  const response = { 400: problemSchema, 401: problemSchema, 403: problemSchema, 404: problemSchema };
  const bodySchema = {
    type: 'object',
    properties: { key: { type: 'string', maxLength: 3 } },
    required: ['key'],
  } as const;

  app.post('/validated', { schema: { body: bodySchema, response } }, async () => ({ ok: true }));
  app.get('/unauthorized', { schema: { response } }, async () => {
    throw new UnauthorizedError();
  });
  app.get('/forbidden', { schema: { response } }, async () => {
    throw new ForbiddenError();
  });
  app.get('/not-found', { schema: { response } }, async () => {
    throw new NotFoundError({ message: 'flag abc missing', detail: 'Flag not found.', context: { id: 'abc' } });
  });
  app.get('/conflict', async () => {
    throw new ConflictError({
      message: 'dupe',
      detail: 'Already exists.',
      errors: [{ field: 'key', code: 'DUPLICATE' }],
    });
  });
  app.get('/unprocessable', async () => {
    throw new UnprocessableError({ message: 'rule', detail: 'Rule violated.' });
  });
  app.get('/internal', async () => {
    throw new InternalError({ message: 'db down', context: { table: 'flags' } });
  });
  app.get('/unexpected', async () => {
    throw new Error('duplicate key value violates unique constraint "flags_pkey"');
  });

  return app;
}

describe('error contract', () => {
  const app = buildApp();

  it.each([
    ['/unauthorized', 401, ErrorCode.Unauthorized],
    ['/forbidden', 403, ErrorCode.Forbidden],
    ['/not-found', 404, ErrorCode.NotFound],
    ['/conflict', 409, ErrorCode.Conflict],
    ['/unprocessable', 422, ErrorCode.Unprocessable],
    ['/internal', 500, ErrorCode.Internal],
    ['/unexpected', 500, ErrorCode.Internal],
  ])('%s is a %i %s problem document', async (url, status, code) => {
    const response = await app.inject({ method: 'GET', url });
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(status);
    expect(response.headers['content-type']).toContain(PROBLEM_CONTENT_TYPE);
    expect(body).toMatchObject({ status, code, instance: expect.any(String) });
    expect(body.type).toMatch(/^urn:fliposs:error:[a-z-]+$/);
    expect(body.title).toBeTruthy();
  });

  it('keeps detail and field errors through the declared response schema', async () => {
    const response = await app.inject({ method: 'GET', url: '/not-found' });

    expect(JSON.parse(response.body)).toMatchObject({ detail: 'Flag not found.' });
  });

  it('answers an unmatched route with a 404 problem document', async () => {
    const response = await app.inject({ method: 'GET', url: '/no/such/route' });

    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toContain(PROBLEM_CONTENT_TYPE);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 404,
      code: ErrorCode.NotFound,
      detail: 'The requested resource does not exist.',
      instance: expect.any(String),
    });
    expect(response.body).not.toContain('/no/such/route');
  });

  it('turns a schema validation failure into 400 with field errors', async () => {
    const response = await app.inject({ method: 'POST', url: '/validated', payload: { key: 'toolong' } });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      code: ErrorCode.Validation,
      errors: [{ field: 'key', code: 'TOO_LONG' }],
    });
  });

  it('reports a missing required field', async () => {
    const response = await app.inject({ method: 'POST', url: '/validated', payload: {} });

    expect(JSON.parse(response.body).errors).toEqual([{ field: 'key', code: 'REQUIRED', detail: expect.any(String) }]);
  });

  it('turns malformed JSON into a 400 problem', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/validated',
      headers: { 'content-type': 'application/json' },
      payload: '{ not json',
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({ status: 400, code: ErrorCode.Validation });
  });

  it('normalizes an oversized body to a validation problem', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/validated',
      payload: { key: 'x', padding: 'y'.repeat(200) },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({ status: 400, code: ErrorCode.Validation });
  });

  it('never leaks internals from any error exit', async () => {
    for (const url of ['/not-found', '/internal', '/unexpected']) {
      const body = (await app.inject({ method: 'GET', url })).body;

      expect(body).not.toContain('abc');
      expect(body).not.toContain('flags');
      expect(body).not.toContain('unique constraint');
      expect(body).not.toContain('stack');
      expect(body).not.toContain('context');
    }
  });
});

describe('no error-response bypass', () => {
  const srcRoot = join(import.meta.dirname, '..');
  const files = globSync(join(srcRoot, '**', '*.ts')).filter((file) => !/__tests__|[\\/]test[\\/]/.test(file));
  const handRolled = /reply\s*\.\s*(?:code|status)\s*\(\s*[45]\d\d\s*\)/;

  it('scans the source tree', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('only errors/problem.ts writes a 4xx/5xx reply', () => {
    const offenders = files
      .filter((file) => !file.endsWith(join('errors', 'problem.ts')))
      .filter((file) => handRolled.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(srcRoot, ''));

    expect(offenders).toEqual([]);
  });
});

// A wrong error schema (e.g. `404: { type: 'string' }`) serializes the problem body as "[object Object]";
// declaring none is safe. A status-only test cannot see the damage, so guard the declarations.
describe('route error responses describe a problem document', () => {
  const routesRoot = join(import.meta.dirname, '..', 'routes');
  const files = globSync(join(routesRoot, '**', '*.ts')).filter((file) => !/__tests__/.test(file));
  const errorStatusEntry = /^\s*'?([45]\d\d)'?\s*:\s*(.+?)[;,]?\s*$/gm;

  it('scans the route tree', () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it.each(files)('%s', (file) => {
    const wrong = [...readFileSync(file, 'utf8').matchAll(errorStatusEntry)]
      .filter(([, , value]) => !value.includes('problemSchema'))
      .map(([, status, value]) => `${status}: ${value}`);

    expect(wrong).toEqual([]);
  });
});
