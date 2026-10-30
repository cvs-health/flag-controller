// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

const start = vi.fn();
class MockNodeSDK {
  start = start;
}
const NodeSDK = vi.fn(MockNodeSDK);

vi.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: vi.fn(() => []),
}));

vi.mock('@opentelemetry/exporter-metrics-otlp-http', () => ({
  OTLPMetricExporter: vi.fn(),
}));

vi.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: vi.fn(),
}));

vi.mock('@opentelemetry/resources', () => ({
  resourceFromAttributes: vi.fn(() => ({})),
}));

vi.mock('@opentelemetry/sdk-metrics', () => ({
  ConsoleMetricExporter: vi.fn(),
  PeriodicExportingMetricReader: vi.fn(),
}));

vi.mock('@opentelemetry/sdk-node', () => ({ NodeSDK }));

vi.mock('@opentelemetry/sdk-trace-node', () => ({
  ConsoleSpanExporter: vi.fn(),
}));

describe('otel setup', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('starts OpenTelemetry when enabled', async () => {
    process.env.OTEL_SDK_DISABLED = 'false';

    await import('../otel.setup.js');

    expect(NodeSDK).toHaveBeenCalledOnce();
    expect(start).toHaveBeenCalledOnce();
  });

  it('does not start OpenTelemetry when disabled', async () => {
    process.env.OTEL_SDK_DISABLED = 'true';

    await import('../otel.setup.js');

    expect(NodeSDK).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
  });
});
