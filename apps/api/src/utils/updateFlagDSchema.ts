// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FLAGD_SCHEMA_BASE_URL = 'https://flagd.dev/schema/v0';
const TARGETING_SCHEMA_URL = `${FLAGD_SCHEMA_BASE_URL}/targeting.json`;
const FLAGS_SCHEMA_URL = `${FLAGD_SCHEMA_BASE_URL}/flags.json`;
const SCHEMAS_DIRECTORY = resolve(__dirname, '../schemas');
const TARGETING_SCHEMA_PATH = resolve(SCHEMAS_DIRECTORY, 'targeting.json');
const FLAGD_SCHEMA_PATH = resolve(SCHEMAS_DIRECTORY, 'flagd.json');
const FLAGD_TYPES_PATH = resolve(__dirname, '../../../../libs/shared-types/src/flagd.ts');

const REQUEST_INIT = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
};

type SchemaDocument = Record<string, unknown>;

async function fetchSchema(url: string) {
  const response = await fetch(url, REQUEST_INIT);

  if (!response.ok) {
    throw new Error(`Failed to fetch schema from ${url}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as SchemaDocument;
}

/**
 * json-schema-to-typescript v15 cannot compile schemas whose root is a `$ref`.
 * Its dereferencer leaves stale refs that the parser rejects. This resolves a
 * root-level `$ref` that points inside the same document (e.g.
 * `#/definitions/providerConfig`) by inlining the referenced definition.
 *
 * The on-disk schemas are NOT modified — this runs only on the in-memory copy
 * used for type generation.
 */
function resolveRootRef(schema: SchemaDocument): SchemaDocument {
  const ref = schema.$ref;
  if (typeof ref !== 'string' || !ref.startsWith('#/')) {
    return schema;
  }

  const segments = ref.replace(/^#\//, '').split('/');
  let target: unknown = schema;
  for (const segment of segments) {
    if (!target || typeof target !== 'object' || !(segment in target)) {
      return schema;
    }
    target = (target as Record<string, unknown>)[segment];
  }

  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return schema;
  }

  const { $ref: _, ...rest } = schema;
  return { ...rest, ...(target as SchemaDocument) };
}

/**
 * json-schema-to-typescript emits index signatures without `undefined` even when
 * the same interface contains optional named properties. TypeScript requires that
 * every named property's type is assignable to the index signature value type, but
 * optional properties are implicitly `T | undefined`, which is not assignable to a
 * value type that omits `undefined`.
 *
 * This post-processing step detects interfaces that mix optional named properties
 * with a concrete (non-`unknown`) index signature and widens the index value type
 * to include `undefined`.
 */
function fixStrictIndexSignatures(source: string): string {
  return source.replace(/export interface \w+ \{[\s\S]*?\n\}/g, (interfaceBlock) => {
    if (!/\w+\?\s*:/.test(interfaceBlock)) {
      return interfaceBlock;
    }

    return interfaceBlock.replace(
      /(\[k: string\]: )((?!unknown\b)(?!.*\bundefined\b).+)(;)\s*\n\}/,
      (match, prefix: string, indexType: string, semi: string) => `${prefix}${indexType} | undefined${semi}\n}`,
    );
  });
}

/**
 * json-schema-to-typescript emits `{}` for empty-object schemas (e.g. flagd's
 * "empty targeting" branch). Biome's `noBannedTypes` rule flags `{}` because it
 * means "any non-nullable value". This widens those union members to `object`,
 * which keeps the same permissive shape (objects and arrays remain assignable)
 * while satisfying the linter.
 */
function fixEmptyObjectType(source: string): string {
  return source.replace(/^(\s*)\| \{\}$/gm, '$1| object');
}

async function updateFlagDSchema() {
  const [targetingSchema, flagdSchema] = await Promise.all([
    fetchSchema(TARGETING_SCHEMA_URL),
    fetchSchema(FLAGS_SCHEMA_URL),
  ]);

  fs.writeFileSync(TARGETING_SCHEMA_PATH, `${JSON.stringify(targetingSchema, null, 2)}\n`);
  fs.writeFileSync(FLAGD_SCHEMA_PATH, `${JSON.stringify(flagdSchema, null, 2)}\n`);

  const schemaFromDisk = JSON.parse(fs.readFileSync(FLAGD_SCHEMA_PATH, 'utf-8')) as SchemaDocument;
  const ts = await compile(resolveRootRef(schemaFromDisk), 'FlagdFlagConfiguration', {
    cwd: SCHEMAS_DIRECTORY,
  });

  fs.writeFileSync(FLAGD_TYPES_PATH, fixEmptyObjectType(fixStrictIndexSignatures(ts)));

  console.log('flagd schema and typings updated');
}

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  updateFlagDSchema().catch((error) => {
    console.error('Failed to update flagd schema and typings');
    console.error(error);
    process.exitCode = 1;
  });
}

export default updateFlagDSchema;
