// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import 'dotenv/config';
import { createRequire } from 'node:module';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

import { isOtelEnabled } from './otel.config.js';

const packageJson = createRequire(import.meta.url)('../package.json');

let sdk: NodeSDK | undefined;

if (isOtelEnabled()) {
  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'flag-controller';
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: packageJson.version,
  });

  const traceExporter = pickTraceExporter(process.env.OTEL_TRACES_EXPORTER);
  const metricExporter = pickMetricExporter(process.env.OTEL_METRICS_EXPORTER);
  const exportIntervalMillis = Number(process.env.OTEL_METRIC_EXPORT_INTERVAL) || 60_000;

  sdk = new NodeSDK({
    resource,
    ...(traceExporter ? { traceExporter } : {}),
    ...(metricExporter
      ? {
          metricReaders: [
            new PeriodicExportingMetricReader({
              exporter: metricExporter,
              exportIntervalMillis,
            }),
          ],
        }
      : {}),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-pg': { enabled: true },
        '@opentelemetry/instrumentation-graphql': { enabled: true },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
      }),
    ],
  });

  sdk.start();
}

export async function shutdownOtel() {
  if (!sdk) {
    return;
  }

  const activeSdk = sdk;
  sdk = undefined;

  try {
    await activeSdk.shutdown();
  } catch (error) {
    console.error('Error shutting down OpenTelemetry', error);
  }
}

function pickTraceExporter(name: string | undefined): SpanExporter | undefined {
  switch ((name ?? 'otlp').toLowerCase()) {
    case 'none':
      return undefined;
    case 'console':
      return new ConsoleSpanExporter();
    default:
      return new OTLPTraceExporter();
  }
}

function pickMetricExporter(name: string | undefined): PushMetricExporter | undefined {
  switch ((name ?? 'otlp').toLowerCase()) {
    case 'none':
      return undefined;
    case 'console':
      return new ConsoleMetricExporter();
    default:
      return new OTLPMetricExporter();
  }
}
