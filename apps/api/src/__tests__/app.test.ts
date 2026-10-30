// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import build from '../app.js';

const mocks = vi.hoisted(() => ({
  otelPlugin: vi.fn(),
  setup: vi.fn(),
  setErrorHandler: vi.fn(),
  setNotFoundHandler: vi.fn(),
}));

vi.mock('../plugins/otel.js', () => ({
  fastifyOtel: {
    plugin: mocks.otelPlugin,
  },
}));
vi.mock('fastify', () => ({
  default: vi.fn(() => ({
    addHook: vi.fn(),
    addSchema: vi.fn(),
    register: vi.fn(),
    setErrorHandler: mocks.setErrorHandler,
    setNotFoundHandler: mocks.setNotFoundHandler,
  })),
}));

vi.mock('../utils/setup.js', () => ({
  default: mocks.setup,
}));

describe('app', () => {
  it('handles the default setup', async () => {
    await build({});

    expect(mocks.setup).toHaveBeenCalledOnce();
    expect(mocks.otelPlugin).toHaveBeenCalledOnce();
  });

  it('registers the error handler and the not-found handler', async () => {
    await build({});

    expect(mocks.setErrorHandler).toHaveBeenCalledOnce();
    expect(mocks.setNotFoundHandler).toHaveBeenCalledOnce();
  });
});
