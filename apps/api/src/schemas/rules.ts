// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Clause, Operator, RuleConditionType, RuleConditionValueType, RuleServeType, TimeZone } from 'shared-types';

import { RulesServeAction } from 'services/rulesService.js';
import { fractionalSchema, weightsSchema } from './fractionals.js';

const updateFractionalValueSchema = {
  type: 'object',
  properties: {
    var: fractionalSchema.properties.var,
    weights: fractionalSchema.properties.weights,
    type: fractionalSchema.properties.type,
  },
  minProperties: 1,
} as const;
const createFractionalValueSchema = {
  type: 'object',
  properties: {
    var: fractionalSchema.properties.var,
    weights: fractionalSchema.properties.weights,
    type: fractionalSchema.properties.type,
  },
  required: ['var', 'weights', 'type'],
} as const;
export const rolloutSchema = {
  type: 'object',
  properties: {
    percentages: weightsSchema,
    context: { type: 'string' },
    attribute: { type: 'string' },
  },
  required: ['percentages', 'context'],
  additionalProperties: true,
} as const;
const segmentRuleConditionSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    segmentId: { type: 'string' },
    operator: {
      type: 'string',
      enum: Object.values(Operator),
    },
    clause: {
      type: 'string',
      enum: Object.values(Clause),
    },
    type: {
      type: 'string',
      enum: [RuleConditionType.Segment],
    },
  },
  required: ['operator', 'clause', 'segmentId', 'type'],
} as const;
const timeRuleConditionSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    endDate: { type: ['string', 'null'], format: 'date-time' },
    operator: {
      type: 'string',
      enum: Object.values(Operator),
    },
    clause: {
      type: 'string',
      enum: Object.values(Clause),
    },
    startDate: { type: 'string', format: 'date-time' },
    type: {
      type: 'string',
      enum: [RuleConditionType.Time],
    },
    startDateTimeZone: { type: 'string', enum: Object.values(TimeZone) },
    endDateTimeZone: { type: ['string', 'null'], enum: [...Object.values(TimeZone), null] },
  },
  required: ['operator', 'clause', 'startDate', 'endDate', 'type', 'startDateTimeZone', 'endDateTimeZone'],
} as const;
const contextRuleConditionSchema = {
  additionalProperties: false,
  type: 'object',
  properties: {
    context: { type: 'string' },
    attribute: { type: 'string' },
    operator: {
      type: 'string',
      enum: Object.values(Operator),
    },
    values: {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
        { type: 'array', items: { type: 'string' } },
        { type: 'array', items: { type: 'number' } },
        { type: 'array', items: { type: 'boolean' } },
      ],
    },
    valuesType: {
      type: 'string',
      enum: Object.values(RuleConditionValueType),
    },
    clause: {
      type: 'string',
      enum: Object.values(Clause),
    },
    type: {
      type: 'string',
      enum: [RuleConditionType.Context],
    },
  },
  required: ['context', 'operator', 'values', 'clause', 'type', 'valuesType'],
} as const;
export const ruleSchema = {
  type: 'object',
  properties: {
    conditions: {
      type: 'array',
      items: {
        anyOf: [contextRuleConditionSchema, segmentRuleConditionSchema, timeRuleConditionSchema],
      },
      minItems: 0,
    },
    flagId: { type: ['string', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
    deletedAt: { type: ['string', 'null'], format: 'date-time' },
    environmentId: { type: 'string' },
    id: { type: 'string' },
    key: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
    orderPosition: { type: 'number' },
    segmentId: { type: ['string', 'null'] },
    serveFractionalId: { type: ['string', 'null'] },
    serveVariationKey: { type: ['string', 'null'] },
    serveVariationId: { type: ['string', 'null'] },
    serveFractional: {
      type: ['object', 'null'],
      properties: {
        var: fractionalSchema.properties.var,
        weights: fractionalSchema.properties.weights,
        type: fractionalSchema.properties.type,
      },
      required: ['var', 'weights', 'type'],
    },
  },
  required: [
    'conditions',
    'environmentId',
    'id',
    'key',
    'orderPosition',
    'serveFractionalId',
    'serveVariationKey',
    'serveVariationId',
    'updatedAt',
    'createdAt',
    'deletedAt',
    'flagId',
    'segmentId',
  ],
} as const;
export const updateFractionalSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [RuleServeType.Fractional],
    },
    action: {
      type: 'string',
      enum: [RulesServeAction.Update],
    },
    id: { type: 'string' },
    value: updateFractionalValueSchema,
  },
  required: ['type', 'action', 'id', 'value'],
} as const;
export const createFractionalSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [RuleServeType.Fractional],
    },
    action: {
      type: 'string',
      enum: [RulesServeAction.Create],
    },
    value: createFractionalValueSchema,
  },
  required: ['type', 'action', 'value'],
} as const;
const serveSchema = {
  anyOf: [
    { type: 'null' },
    {
      oneOf: [updateFractionalSchema, createFractionalSchema],
    },
  ],
} as const;
export const updateFeatureFlagRuleSchema = {
  type: 'object',
  properties: {
    conditions: ruleSchema.properties.conditions,
    id: ruleSchema.properties.id,
    orderPosition: ruleSchema.properties.orderPosition,
    serve: serveSchema,
    serveFractionalId: ruleSchema.properties.serveFractionalId,
    serveVariationId: ruleSchema.properties.serveVariationId,
  },
  minProperties: 2,
  required: ['id'],
} as const;
export const updateSegmentRuleSchema = {
  type: 'object',
  properties: {
    conditions: ruleSchema.properties.conditions,
    id: ruleSchema.properties.id,
    orderPosition: ruleSchema.properties.orderPosition,
  },
  minProperties: 2,
  required: ['id'],
} as const;
export const createFeatureFlagRuleSchema = {
  type: 'object',
  properties: {
    conditions: ruleSchema.properties.conditions,
    environmentId: ruleSchema.properties.environmentId,
    flagId: { type: 'string' },
    key: ruleSchema.properties.key,
    orderPosition: ruleSchema.properties.orderPosition,
    serve: serveSchema,
    serveFractionalId: ruleSchema.properties.serveFractionalId,
    serveVariationId: ruleSchema.properties.serveVariationId,
  },
  additionalProperties: false,
  required: ['conditions', 'orderPosition', 'key', 'environmentId', 'flagId', 'serveVariationId', 'serveFractionalId'],
} as const;
export const createSegmentRuleSchema = {
  type: 'object',
  properties: {
    conditions: ruleSchema.properties.conditions,
    environmentId: ruleSchema.properties.environmentId,
    key: ruleSchema.properties.key,
    orderPosition: ruleSchema.properties.orderPosition,
    segmentId: { type: 'string' },
  },
  additionalProperties: false,
  required: ['conditions', 'orderPosition', 'key', 'segmentId', 'environmentId'],
} as const;
