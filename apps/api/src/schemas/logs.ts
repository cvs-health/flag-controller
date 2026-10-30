// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, EnvironmentKey, SubjectType } from 'shared-types';

export const actionSchema = {
  type: 'string',
  enum: Object.values(ActionType),
} as const;
export const actionTypesSchema = {
  type: 'array',
  items: actionSchema,
} as const;
export const subjectTypeSchema = {
  type: 'string',
  enum: Object.values(SubjectType),
} as const;
export const subjectTypesSchema = {
  type: 'array',
  items: subjectTypeSchema,
} as const;
const subjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    key: { type: 'string' },
    type: subjectTypeSchema,
  },
  additionalProperties: false,
} as const;
const actorSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
  },
  additionalProperties: false,
} as const;
export const logSchema = {
  type: 'object',
  properties: {
    action: actionSchema,
    actorId: { type: 'string' },
    applicationId: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    environmentId: { type: ['string', 'null'] },
    id: { type: 'string' },
    newData: { type: ['object', 'null'], additionalProperties: true },
    oldData: { type: ['object', 'null'], additionalProperties: true },
    subjectId: { type: 'string' },
    subjectKey: { type: 'string' },
    subjectType: subjectTypeSchema,
  },
  required: ['action', 'actorId', 'applicationId', 'createdAt', 'id', 'subjectId', 'subjectKey', 'subjectType'],
  additionalProperties: true,
} as const;
const applicationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: ['string', 'null'] },
  },
  additionalProperties: false,
} as const;
const environmentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    key: { oneOf: [{ type: 'null' }, { type: 'string', enum: Object.values(EnvironmentKey) }] },
  },
  additionalProperties: false,
} as const;
export const logListItemSchema = {
  type: 'object',
  properties: {
    action: actionSchema,
    actor: actorSchema,
    application: { oneOf: [applicationSchema, { type: 'null' }] },
    createdAt: { type: 'string', format: 'date-time' },
    environment: { oneOf: [environmentSchema, { type: 'null' }] },
    id: { type: 'string' },
    newData: { type: ['object', 'null'], additionalProperties: true },
    oldData: { type: ['object', 'null'], additionalProperties: true },
    subject: subjectSchema,
  },
  required: ['action', 'actor', 'application', 'createdAt', 'id', 'subject'],
  additionalProperties: false,
} as const;
