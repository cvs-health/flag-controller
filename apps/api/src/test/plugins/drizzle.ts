// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

/**
 * @param responses An array of responses which are returned in the order in which `drizzle` is called
 */
function drizzleDecoration<R>(responses: R | R[]) {
  let currentResponseIndex = 0;

  function handleMethod(...args: unknown[]) {
    currentResponseIndex += 1;

    if (Array.isArray(responses)) {
      const response = responses[currentResponseIndex - 1];
      return typeof response === 'function' ? response(...args) : response;
    }
    return typeof responses === 'function' ? responses(...args) : responses;
  }

  return (fastify: FastifyInstance, _opts: FastifyPluginOptions, done: (err?: Error) => void) => {
    fastify.decorate('drizzle', {
      insert: handleMethod,
      // @ts-expect-error Not all properties need to exist for testing
      select() {
        return {
          from: handleMethod,
        };
      },
      // @ts-expect-error Not all properties need to exist for testing
      selectDistinct() {
        return {
          from: handleMethod,
        };
      },
      transaction: handleMethod,
    });

    done();
  };
}

function drizzlePlugin<R>(responses: R | R[]) {
  return fastifyPlugin(drizzleDecoration(responses));
}

export default drizzlePlugin;
