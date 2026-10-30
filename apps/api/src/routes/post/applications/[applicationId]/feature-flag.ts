// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { Ajv } from 'ajv';
import { featureFlagTypeSchema } from 'schemas/featureFlags.js';

const paramsSchema = {
  type: 'object',
  properties: {
    applicationId: { type: 'string' },
  },
  required: ['applicationId'],
} as const;

const bodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    defaultVariationKey: { type: 'string' },
    description: { type: 'string' },
    enabled: { type: 'boolean' },
    key: { type: 'string' },
    type: featureFlagTypeSchema,
    variations: {
      type: 'object',
      patternProperties: {
        '^.{1,}$': {
          anyOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'number' }, { type: 'object' }],
        },
      },
    },
  },
  required: ['defaultVariationKey', 'description', 'enabled', 'key', 'type', 'variations'],
} as const;

const schema = {
  description: 'Create a feature flag for an application',
  body: bodySchema,
  params: paramsSchema,
  response: {
    200: {
      type: 'object',
      additionalProperties: false,
      properties: {
        applicationId: { type: 'string' },
        archived: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        description: { type: 'string' },
        id: { type: 'string' },
        key: { type: 'string' },
        type: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
      },
      required: [
        'id',
        'applicationId',
        'key',
        'type',
        'description',
        'archived',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    },
  },
  tags: ['applications'],
};

const ajv = new Ajv({
  // Coercing types causes the variations list to be incorrectly validated
  coerceTypes: false,
});

async function postApplicationFeatureFlag(fastify: FastifyInstance) {
  fastify.post<{
    Body: FromSchema<typeof bodySchema>;
    Params: FromSchema<typeof paramsSchema>;
  }>(
    '/applications/:applicationId/feature-flag',
    { schema, validatorCompiler: ({ schema }) => ajv.compile(schema) },
    async (request, reply) => {
      const actor = { id: request.user.id, email: request.user.email };
      const result = await fastify.services.featureFlagService.createFeatureFlag({
        actor,
        applicationId: request.params.applicationId,
        ...request.body,
      });

      return reply.code(200).send(result);
    },
  );
}

export default postApplicationFeatureFlag;
