// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

interface SchemaProperty {
  type: string;
}
interface SchemaProperties {
  [key: string]: SchemaProperty;
}
interface ObjectSchema {
  type: string;
  properties: SchemaProperties;
}

export function addNameToSchemaProperties<S extends ObjectSchema>(schema: S) {
  return {
    ...schema,
    properties: {
      ...schema.properties,
      name: { type: 'string' },
    },
  } as const;
}
