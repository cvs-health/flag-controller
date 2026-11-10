// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';

import { getPublicConfig } from '../../../utils/getAuthConfig.js';

const schema = {
  description: 'Public configuration the UI needs before anyone is signed in',
  response: {
    200: {
      type: 'object',
      properties: {
        authProviders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              kind: { type: 'string', enum: ['social'] },
              label: { type: 'string' },
            },
            required: ['id', 'kind', 'label'],
          },
        },
        features: { type: 'object', additionalProperties: true },
        modes: { type: 'object', additionalProperties: true },
      },
      required: ['authProviders', 'features', 'modes'],
    },
  },
  security: [],
  tags: ['config'],
} as const;

async function getApiConfig(fastify: FastifyInstance) {
  fastify.get('/api/config', { schema }, async () => getPublicConfig());
}

export default getApiConfig;
