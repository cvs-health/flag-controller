// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import 'dotenv/config';

import closeWithGrace from 'close-with-grace';

import { shutdownOtel } from './otel.setup.js';
import build from './app.js';
import { migrate } from './migrate.js';

export async function main() {
  let server: Awaited<ReturnType<typeof build>> | undefined;

  closeWithGrace({ delay: 10_000 }, async ({ err, signal }) => {
    if (err) {
      if (server) {
        server.log.error(err, 'closing with error');
      } else {
        console.error(err, 'closing with error');
      }
    } else if (server) {
      server.log.info(`${signal ?? 'shutdown'} received, closing server`);
    } else {
      console.info(`${signal ?? 'shutdown'} received, closing server`);
    }

    if (server) {
      await server.close();
    }

    await shutdownOtel();
  });

  if (process.env.RUN_MIGRATIONS_ON_START !== 'false') {
    try {
      await migrate();
    } catch (error) {
      console.error(error);
      console.error('😵 Migration failed, shutting down...');
      process.exit(1);
    }
  }

  const host = process.env.HOST ?? '127.0.0.1';
  const appPort = process.env.PORT ?? '8080';

  server = await build({
    logger: true,
  });

  server.listen({ port: Number(appPort), host }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
}

main();
