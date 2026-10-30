// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance } from 'fastify';

import checkSession from '../hooks/checkSession.js';
import flagdSchema from '../schemas/flagd.json' with { type: 'json' };
import targetingSchema from '../schemas/targeting.json' with { type: 'json' };
import registerAllRoutes from './registerAllRoutes.js';

async function setup(fastify: FastifyInstance) {
  fastify.addSchema(flagdSchema);
  fastify.addSchema(targetingSchema);

  fastify.addHook('preValidation', checkSession);

  registerAllRoutes(fastify);
}

export default setup;
