// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import {
  Clause,
  Operator,
  RuleConditionType,
  RuleConditionValueType,
  type SegmentRule as ISegmentRule,
} from 'shared-types';
import { z } from 'zod';

import styles from './SegmentRule.module.scss';
import { Button, FormLabel, Stack, TextInput } from '../../components/Carbon';
import { RuleConditional } from '../../typings/rules';
import { lowercaseKebabCasePattern } from '../../constants/common';
import { RuleConditionLegacy } from '../../components/RuleConditionLegacy/RuleConditionLegacy';
import generateConditionId from '../../utils/generateConditionId';
import useInputValidation from '../../hooks/useInputValidation';

interface SegmentRuleProps {
  assignedKey: string;
  defaultConditions: ISegmentRule['conditions'];
  id: string;
  newRule?: boolean;
}

export function SegmentRule({ assignedKey, defaultConditions = [], id, newRule = false }: SegmentRuleProps) {
  const inputValidation = useInputValidation({
    schema: z.string().min(1, 'Rule key is required.'),
  });
  const [conditions, setConditions] = useState(
    defaultConditions.map((condition) => ({ ...condition, id: Math.random().toString() })),
  );

  function handleRemoveCondition(conditionPosition: number) {
    const updatedConditions = conditions.filter((_, index) => index !== conditionPosition);

    setConditions(updatedConditions);
  }

  return (
    <Stack gap={6} id={id.toString()}>
      {newRule ? (
        <TextInput
          autoFocus
          data-testid="new-custom-rule-key"
          defaultValue={assignedKey}
          helperText="Format should follow a lowercase, kebab-case convention (ex. my-feature-flag-rule)"
          id="key"
          invalid={!!inputValidation.error}
          invalidText={inputValidation.error}
          labelText="Custom rule key"
          name="key"
          onBlur={inputValidation.handleBlur}
          onChange={inputValidation.handleChange}
          onInvalid={inputValidation.handleInvalid}
          pattern={lowercaseKebabCasePattern.source}
          required
          type="text"
        />
      ) : (
        <div>
          <FormLabel>Rule key</FormLabel>
          <div className={styles.assignedKey}>{assignedKey}</div>
          <input type="hidden" name="key" value={assignedKey} readOnly />
        </div>
      )}
      {conditions.map((condition, index) => (
        <RuleConditionLegacy
          attribute={condition.attribute}
          conditional={index ? RuleConditional.And : RuleConditional.If}
          context={condition.context}
          key={condition.id}
          onRemove={handleRemoveCondition}
          operator={condition.operator}
          position={index}
          values={condition.values as string}
        />
      ))}
      <Button
        size="md"
        onClick={() =>
          setConditions([
            ...conditions,
            {
              clause: Clause.And,
              context: 'user',
              id: generateConditionId(id, conditions.length, conditions),
              operator: Operator.In,
              type: RuleConditionType.Context,
              values: '',
              valuesType: RuleConditionValueType.String,
            },
          ])
        }
        kind="tertiary"
      >
        Add AND condition
      </Button>
      <input type="hidden" name="created" value={newRule.toString()} readOnly />
      <input type="hidden" name="id" value={id} readOnly />
    </Stack>
  );
}
