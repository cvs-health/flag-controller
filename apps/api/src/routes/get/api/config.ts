// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';

import { getPublicConfig } from '../../../utils/getAuthConfig.js';

const identityMode = { type: 'string', enum: ['local', 'external'] } as const;

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
              kind: { type: 'string', enum: ['social', 'oidc'] },
              label: { type: 'string' },
            },
            required: ['id', 'kind'],
          },
        },
        features: { type: 'object', additionalProperties: true },
        modes: {
          type: 'object',
          properties: {
            users: identityMode,
            teams: identityMode,
            memberships: identityMode,
            applications: identityMode,
          },
          required: ['users', 'teams', 'memberships', 'applications'],
        },
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
