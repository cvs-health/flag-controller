import type { FromSchema } from 'json-schema-to-ts';

import { ruleSchema } from 'schemas/rules.js';
import type { PreSerializedFromSchema } from './preSerializedFromSchema.js';

// PreSerializedFromSchema maps every date-time to Date, including ones nested in conditions.
// conditions is a jsonb column, so those values stay strings; type that field with plain FromSchema.
type PreSerializedRule = PreSerializedFromSchema<typeof ruleSchema>;

export type RuleReply = {
  [Key in keyof PreSerializedRule]: Key extends 'conditions'
    ? FromSchema<typeof ruleSchema.properties.conditions>
    : PreSerializedRule[Key];
};
