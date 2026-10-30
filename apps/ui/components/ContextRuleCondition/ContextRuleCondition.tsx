// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Button, Select, SelectItem, Stack, TextArea, TextInput } from '@carbon/react';
import { Clause, Operator, RuleConditionType, RuleConditionValueType, type Values } from 'shared-types';
import { SubtractAlt } from '@carbon/icons-react';
import { type ChangeEvent, useState } from 'react';
import { z } from 'zod';

import getRuleConditionFieldId from '../../utils/getRuleConditionFieldId';
import styles from './ContextRuleCondition.module.scss';
import type { RuleConditional } from '../../typings/rules';
import useInputValidation from '../../hooks/useInputValidation';
import { operatorTranslation, ruleConditionalTranslation, ruleConditionValueTypeLabels } from '../../constants/common';

interface ContextRuleConditionProps {
  id: string;
  attribute?: string;
  className?: string;
  conditional: RuleConditional;
  context: string;
  disabled?: boolean;
  onRemove: (id: string) => void;
  operator: Operator;
  position: number;
  ruleId: string;
  values: Values;
  valuesType?: RuleConditionValueType;
}

export function ContextRuleCondition({
  attribute,
  id,
  className = '',
  conditional,
  context,
  disabled = false,
  onRemove,
  operator,
  position,
  ruleId,
  values,
  valuesType = RuleConditionValueType.String,
}: ContextRuleConditionProps) {
  const [selectedOperator, setSelectedOperator] = useState(operator);
  const [valueDraft, setValueDraft] = useState(Array.isArray(values) ? values.join('\n') : String(values));
  const inputValidation = useInputValidation({
    schema: z.string().min(1, 'Context is required.'),
  });
  const valueInputValidation = useInputValidation({
    schema: z.string().trim().min(1, 'Value is required.'),
  });
  const contextId = getRuleConditionFieldId(id, position, 'context');
  const attributeId = getRuleConditionFieldId(id, position, 'attribute');
  const operatorId = getRuleConditionFieldId(id, position, 'operator');
  const valuesId = getRuleConditionFieldId(id, position, 'values');

  function handleOperatorChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedOperator(event.target.value as Operator);
  }

  function handleValueChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValueDraft(event.target.value);
    valueInputValidation.handleChange(undefined, event.target.value);
  }

  return (
    <div className={className}>
      <Stack gap={5}>
        <div className={styles.conditional}>
          {ruleConditionalTranslation[conditional]}
          {!disabled ? (
            <Button
              className={styles.remove}
              iconDescription="Remove condition"
              kind="danger--ghost"
              onClick={() => onRemove(id)}
              size="sm"
              renderIcon={SubtractAlt}
            >
              Remove condition
            </Button>
          ) : null}
        </div>
        <div className={styles.row}>
          <TextInput
            className={styles.column}
            defaultValue={context}
            helperText="The top level property from your context to evaluate against. No whitespace allowed."
            id={contextId}
            invalid={!!inputValidation.error}
            invalidText={inputValidation.error}
            labelText="Context"
            name={`${id}-context`}
            onBlur={inputValidation.handleBlur}
            onChange={inputValidation.handleChange}
            onInvalid={inputValidation.handleInvalid}
            pattern="\w*"
            readOnly={disabled}
            required
          />
          <TextInput
            className={styles.column}
            defaultValue={attribute}
            helperText="Nested attributes can be accessed via dot notation (ex. address.city). No whitespace allowed."
            id={attributeId}
            name={`${id}-attribute`}
            pattern="\w+(\.\w+)*"
            readOnly={disabled}
            labelText="Attribute"
          />
        </div>
        <div className={styles.row}>
          <Select
            className={styles.column}
            defaultValue={operator}
            helperText="Multiple values are only supported with 'is one of' and 'is not one of'."
            id={operatorId}
            labelText="Operator"
            name={`${id}-operator`}
            onChange={handleOperatorChange}
            readOnly={disabled}
            required
          >
            {Object.entries(operatorTranslation).map(([value, label]) => (
              <SelectItem value={value} text={label} key={value} />
            ))}
          </Select>
          <Select
            className={styles.column}
            defaultValue={valuesType}
            helperText="All values must match the selected type."
            id={`${id}-valuesType`}
            labelText="Type"
            name={`${id}-valuesType`}
            readOnly={disabled}
          >
            {Object.entries(ruleConditionValueTypeLabels).map(([value, text]) => (
              <SelectItem value={value} text={text} key={value} />
            ))}
          </Select>
        </div>
        {[Operator.InList, Operator.NotInList].includes(selectedOperator) ? (
          <TextArea
            className={styles.column}
            value={valueDraft}
            helperText="Type one value per line. Or paste from a spreadsheet or text file."
            id={valuesId}
            invalid={!!valueInputValidation.error}
            invalidText={valueInputValidation.error}
            labelText="Value"
            name={`${id}-values`}
            onBlur={valueInputValidation.handleBlur}
            onChange={handleValueChange}
            onInvalid={valueInputValidation.handleInvalid}
            placeholder="Type one value per line"
            readOnly={disabled}
            required
            rows={6}
          />
        ) : (
          <TextInput
            className={styles.column}
            value={valueDraft}
            id={valuesId}
            invalid={!!valueInputValidation.error}
            invalidText={valueInputValidation.error}
            labelText="Value"
            name={`${id}-values`}
            onBlur={valueInputValidation.handleBlur}
            onChange={handleValueChange}
            onInvalid={valueInputValidation.handleInvalid}
            readOnly={disabled}
            required
            type="text"
          />
        )}
      </Stack>
      <input type="hidden" name={`${id}-clause`} value={Clause.And} />
      <input type="hidden" name={`${id}-conditionType`} value={RuleConditionType.Context} />
      <input type="hidden" name={`${ruleId}-conditionId`} value={id} />
    </div>
  );
}
