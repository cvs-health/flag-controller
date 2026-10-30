// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import updateFlagDSchema from '../updateFlagDSchema.js';

vi.mock('json-schema-to-typescript', () => ({
  compile: vi.fn(async () => 'export type FlagdFlagConfiguration = Record<string, unknown>;\n'),
}));

const { compile } = await import('json-schema-to-typescript');
const mockedCompile = vi.mocked(compile);

const targetingSchema = {
  $id: 'https://flagd.dev/schema/v0/targeting.json',
  type: 'object',
  anyOf: [
    {
      type: 'object',
    },
    {
      $ref: '#/definitions/anyRule',
    },
  ],
  definitions: {
    anyRule: {
      type: 'object',
      properties: {
        if: {
          $ref: '#/definitions/args',
        },
      },
    },
    args: {
      type: 'string',
    },
  },
};

const flagdSchema = {
  $id: 'https://flagd.dev/schema/v0/flags.json',
  $ref: '#/definitions/providerConfig',
  definitions: {
    providerConfig: {
      type: 'object',
      properties: {
        flags: {
          type: 'object',
        },
      },
    },
  },
};

function createFetchResponse(body: object, overrides: Partial<Response> = {}) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
    ...overrides,
  } as Response;
}

function mockFetchSuccess() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (String(url).endsWith('/targeting.json')) {
      return createFetchResponse(targetingSchema);
    }

    return createFetchResponse(flagdSchema);
  });
}

describe('updateFlagDSchema', () => {
  let writeFileSpy: ReturnType<typeof vi.spyOn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();

    writeFileSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(flagdSchema));
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    mockedCompile.mockResolvedValue('export type FlagdFlagConfiguration = Record<string, unknown>;\n');
  });

  it('fetches both schemas, writes them as-is, and generates types with root $ref resolved', async () => {
    const fetchSpy = mockFetchSuccess();

    await updateFlagDSchema();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls.map(([url]) => String(url))).toEqual([
      'https://flagd.dev/schema/v0/targeting.json',
      'https://flagd.dev/schema/v0/flags.json',
    ]);

    // Schemas written to disk as-is (not transformed)
    expect(writeFileSpy).toHaveBeenCalledTimes(3);
    expect((writeFileSpy.mock.calls[0]?.[0] as string).includes('schemas/targeting.json')).toBe(true);
    expect(writeFileSpy.mock.calls[0]?.[1]).toEqual(`${JSON.stringify(targetingSchema, null, 2)}\n`);
    expect((writeFileSpy.mock.calls[1]?.[0] as string).includes('schemas/flagd.json')).toBe(true);
    expect(writeFileSpy.mock.calls[1]?.[1]).toEqual(`${JSON.stringify(flagdSchema, null, 2)}\n`);
    expect((writeFileSpy.mock.calls[2]?.[0] as string).includes('shared-types/src/flagd.ts')).toBe(true);

    // Root $ref resolved for compile: providerConfig inlined, $ref removed
    expect(mockedCompile).toHaveBeenCalledTimes(1);
    const compiledSchema = mockedCompile.mock.lastCall?.[0];
    expect(compiledSchema).not.toHaveProperty('$ref');
    expect(compiledSchema).toMatchObject({
      $id: 'https://flagd.dev/schema/v0/flags.json',
      type: 'object',
      properties: {
        flags: {
          type: 'object',
        },
      },
      definitions: {
        providerConfig: {
          type: 'object',
          properties: {
            flags: {
              type: 'object',
            },
          },
        },
      },
    });
    expect(mockedCompile.mock.lastCall?.[1]).toEqual('FlagdFlagConfiguration');
    expect(consoleSpy).toHaveBeenCalledWith('flagd schema and typings updated');
  });

  it('replaces banned empty-object `{}` union members with `object`', async () => {
    mockFetchSuccess();
    mockedCompile.mockResolvedValue('export type FlagdTargeting =\n  | {}\n  | VarOperation;\n');

    await updateFlagDSchema();

    const writtenTypes = writeFileSpy.mock.calls[2]?.[1] as string;
    expect(writtenTypes).toContain('| object');
    expect(writtenTypes).not.toContain('| {}');
  });

  it('fails when a schema fetch is not successful', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).endsWith('/targeting.json')) {
        return createFetchResponse(targetingSchema);
      }

      return createFetchResponse(
        {},
        {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
        },
      );
    });

    await expect(updateFlagDSchema()).rejects.toThrow(
      'Failed to fetch schema from https://flagd.dev/schema/v0/flags.json: 503 Service Unavailable',
    );
  });

  it('fails when type generation fails after writing schemas', async () => {
    mockFetchSuccess();
    mockedCompile.mockRejectedValue(new Error('compile failed'));

    await expect(updateFlagDSchema()).rejects.toThrow('compile failed');

    expect(writeFileSpy).toHaveBeenCalledTimes(2);
    expect((writeFileSpy.mock.calls[0]?.[0] as string).includes('schemas/targeting.json')).toBe(true);
    expect((writeFileSpy.mock.calls[1]?.[0] as string).includes('schemas/flagd.json')).toBe(true);
  });
});
