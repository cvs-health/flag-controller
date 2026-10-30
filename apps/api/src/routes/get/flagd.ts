// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import compress from '@fastify/compress';
import { Ajv } from 'ajv';
import type { FastifyInstance } from 'fastify';
import type { FlagdFlagConfiguration } from 'shared-types';

import flagd from 'schemas/flagd.json' with { type: 'json' };
import targeting from 'schemas/targeting.json' with { type: 'json' };

async function getFlagD(fastify: FastifyInstance) {
  await fastify.register(compress, { encodings: ['br', 'gzip', 'deflate'] });

  const schema = {
    description: 'Gets all feature flags, FlagD schema compliant',
    response: {
      200: { $ref: 'https://flagd.dev/schema/v0/flags.json' },
    },
    tags: ['flagd'],
  } as const;
  const ajv = new Ajv({
    // Coercing types causes matches against more than one schema to fail
    // This allows properties/flags/patternProperties/^.{1,}$/oneOf to validate correctly
    coerceTypes: false,
  });

  ajv.addSchema(targeting).addSchema(flagd);

  fastify.get<{
    Reply: FlagdFlagConfiguration;
  }>(
    '/flagd',
    {
      schema,
      // Use the ajv instance to validate the response payload
      // Why? The instance that comes with Fastify seems to be inaccurately validating the response payload
      // and throwing errors when the payload is valid against the schema.
      // https://fastify.dev/docs/latest/Reference/Server/#serializercompiler
      serializerCompiler: ({ schema }) => {
        const validate = ajv.compile(schema);

        return (payload) => {
          const valid = validate(payload);

          if (!valid) {
            fastify.log.error(validate.errors, 'Error validating response payload');
          }

          return JSON.stringify(payload);
        };
      },
    },
    async (_request, reply) => {
      const result = await fastify.services.flagdService.getFlagdConfiguration();

      return reply.code(200).send(result);
    },
  );
}

export default getFlagD;
