// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ErrorCode, FieldErrorCode } from 'shared-types';

export const responseMetadataSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    records: { type: 'number' },
    rows: { type: 'number' },
    search: { type: 'string' },
    sort: { type: 'string', pattern: '^[^:]+:(asc|desc)$' },
    summary: { type: 'boolean' },
    totalPages: { type: 'number' },
    totalRecords: { type: 'number' },
  },
  required: ['page', 'records', 'rows', 'totalPages', 'totalRecords'],
} as const;

/**
 * RFC 9457 problem document. Fastify serializes error bodies through this schema and emits only the
 * properties declared here, so it must list every member `toProblem` can set; the contract test
 * enforces that. `required` stays minimal so an omitted optional member is not a serialization error.
 */
export const problemSchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    title: { type: 'string' },
    status: { type: 'integer' },
    code: {
      type: 'string',
      enum: Object.values(ErrorCode),
    },
    detail: { type: 'string' },
    instance: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          code: {
            type: 'string',
            enum: Object.values(FieldErrorCode),
          },
          detail: { type: 'string' },
        },
        required: ['field', 'code'],
      },
    },
  },
  required: ['type', 'title', 'status', 'code'],
} as const;
