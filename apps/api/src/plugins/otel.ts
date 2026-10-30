// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fastifyOtel from '@fastify/otel';
import { trace } from '@opentelemetry/api';

import { isOtelEnabled } from '../otel.config.js';

let fastifyOtelInstance: fastifyOtel.FastifyOtelInstrumentation | null = null;

if (isOtelEnabled()) {
  try {
    // The error handler records exceptions for 5xx only; the plugin would record every thrown 4xx.
    fastifyOtelInstance = new fastifyOtel.FastifyOtelInstrumentation({ recordExceptions: false });
    fastifyOtelInstance.setTracerProvider(trace.getTracerProvider());
  } catch (error) {
    console.error('Failed to create Fastify OTel instrumentation:', error);
  }
}

export { fastifyOtelInstance as fastifyOtel };
