// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type closeWithGrace from 'close-with-grace';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as app from '../app.js';
import { main } from '../index.js';
import * as migrateFile from '../migrate.js';
import { shutdownOtel } from '../otel.setup.js';
import { mockProcessExit } from '../test/mockNodeProcess.js';

type CloseWithGraceWithOptions = (
  options: closeWithGrace.Options,
  handler: closeWithGrace.CloseWithGraceAsyncCallback,
) => void;

const mocks = vi.hoisted(() => ({
  closeWithGrace: vi.fn<CloseWithGraceWithOptions>(),
  serverClose: vi.fn(),
  serverListen: vi.fn(),
  serverLogError: vi.fn(),
  serverLogInfo: vi.fn(),
}));

vi.mock('../app', () => {
  return {
    default: vi.fn(() => ({
      close: mocks.serverClose,
      listen: mocks.serverListen,
      log: {
        error: mocks.serverLogError,
        info: mocks.serverLogInfo,
      },
    })),
  };
});

vi.mock('../migrate', () => {
  return {
    migrate: vi.fn(),
  };
});

vi.mock('../otel.setup', () => ({
  shutdownOtel: vi.fn(),
}));

vi.mock('close-with-grace', () => ({
  default: mocks.closeWithGrace,
}));

describe('main', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('runs migrations by default when RUN_MIGRATIONS_ON_START is unset', async () => {
    vi.stubEnv('RUN_MIGRATIONS_ON_START', undefined);

    await main();

    expect(migrateFile.migrate).toHaveBeenCalledOnce();
    expect(app.default).toHaveBeenCalledOnce();
  });

  it('does not run migrations when RUN_MIGRATIONS_ON_START is false', async () => {
    vi.stubEnv('RUN_MIGRATIONS_ON_START', 'false');

    await main();

    expect(migrateFile.migrate).not.toHaveBeenCalled();
    expect(app.default).toHaveBeenCalledOnce();
  });

  it('runs migrations when RUN_MIGRATIONS_ON_START is true', async () => {
    vi.stubEnv('RUN_MIGRATIONS_ON_START', 'true');

    await main();

    expect(migrateFile.migrate).toHaveBeenCalledOnce();
    expect(app.default).toHaveBeenCalledOnce();
  });

  it('exits with code 1 when the migration fails to run', async () => {
    vi.stubEnv('RUN_MIGRATIONS_ON_START', 'true');
    vi.mocked(migrateFile.migrate).mockRejectedValue(new Error('Pretend this is an error about migrations failing'));
    const mockExit = mockProcessExit(new Error('Mock'));

    await expect(main()).rejects.toThrow();

    expect(migrateFile.migrate).toHaveBeenCalledOnce();
    expect(mockExit).toHaveBeenCalledExactlyOnceWith(1);
    expect(app.default).not.toHaveBeenCalled();
  });

  it('logs and exits with code 1 when the server fails to listen', async () => {
    const listenError = new Error('port in use');
    mocks.serverListen.mockImplementation((_options, callback) => {
      callback(listenError);
    });
    const mockExit = mockProcessExit(new Error('Mock'));

    await expect(main()).rejects.toThrow();

    expect(mocks.serverLogError).toHaveBeenCalledExactlyOnceWith(listenError);
    expect(mockExit).toHaveBeenCalledExactlyOnceWith(1);
  });

  describe('graceful shutdown', () => {
    async function getCloseWithGraceHandler() {
      await main();
      const [options, handler] = mocks.closeWithGrace.mock.calls[0];
      return { handler, options };
    }

    it('logs and shuts down otel when a signal arrives before startup completes', async () => {
      vi.stubEnv('RUN_MIGRATIONS_ON_START', 'true');
      vi.mocked(migrateFile.migrate).mockReturnValue(new Promise(() => {}));
      const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});

      main();
      const [, handler] = mocks.closeWithGrace.mock.calls[0];
      await handler({ signal: 'SIGTERM' });

      expect(app.default).not.toHaveBeenCalled();
      expect(consoleInfo).toHaveBeenCalledExactlyOnceWith('SIGTERM received, closing server');
      expect(mocks.serverLogInfo).not.toHaveBeenCalled();
      expect(mocks.serverClose).not.toHaveBeenCalled();
      expect(shutdownOtel).toHaveBeenCalledOnce();
    });

    it('registers a close-with-grace handler with a bounded delay', async () => {
      const { options } = await getCloseWithGraceHandler();

      expect(options).toEqual({ delay: 10_000 });
    });

    it('logs and closes the server on a clean shutdown signal', async () => {
      const { handler } = await getCloseWithGraceHandler();

      await handler({ signal: 'SIGTERM' });

      expect(mocks.serverLogInfo).toHaveBeenCalledExactlyOnceWith('SIGTERM received, closing server');
      expect(mocks.serverLogError).not.toHaveBeenCalled();
      expect(mocks.serverClose).toHaveBeenCalledOnce();
      expect(shutdownOtel).toHaveBeenCalledOnce();
    });

    it('logs the error and still closes the server when shutting down after an error', async () => {
      const { handler } = await getCloseWithGraceHandler();
      const error = new Error('boom');

      await handler({ err: error });

      expect(mocks.serverLogError).toHaveBeenCalledExactlyOnceWith(error, 'closing with error');
      expect(mocks.serverLogInfo).not.toHaveBeenCalled();
      expect(mocks.serverClose).toHaveBeenCalledOnce();
      expect(shutdownOtel).toHaveBeenCalledOnce();
    });

    it('closes the server before shutting down otel', async () => {
      const callOrder: string[] = [];
      mocks.serverClose.mockImplementation(async () => {
        callOrder.push('server.close');
      });
      vi.mocked(shutdownOtel).mockImplementation(async () => {
        callOrder.push('shutdownOtel');
      });

      const { handler } = await getCloseWithGraceHandler();
      await handler({ signal: 'SIGINT' });

      expect(callOrder).toEqual(['server.close', 'shutdownOtel']);
    });
  });
});
