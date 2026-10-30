// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { Operator } from 'shared-types';
import { Button, Select, SelectItem, Stack, TextInput } from '@carbon/react';
import { SubtractAlt } from '@carbon/icons-react';

import styles from './RuleConditionLegacy.module.scss';
import { RuleConditional } from '../../typings/rules';
import { operatorTranslation, ruleConditionalTranslation } from '../../constants/common';

interface RuleConditionLegacyProps {
  attribute?: string;
  className?: string;
  conditional: RuleConditional;
  context: string;
  disabled?: boolean;
  onRemove: (position: number) => void;
  operator: Operator;
  position: number;
  values: string;
}

export function RuleConditionLegacy({
  attribute,
  className = '',
  conditional,
  context,
  disabled = false,
  onRemove,
  operator,
  position,
  values,
}: RuleConditionLegacyProps) {
  const operators = Object.entries(operatorTranslation).filter(
    ([value]) => value !== Operator.InList && value !== Operator.NotInList,
  );
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.conditional}>
        {ruleConditionalTranslation[conditional]}
        {position && !disabled ? (
          <Button
            className={styles.remove}
            hasIconOnly
            iconDescription="Remove condition"
            kind="danger--ghost"
            onClick={() => onRemove(position)}
            size="sm"
            tooltipPosition="right"
          >
            <SubtractAlt title="Remove condition" />
          </Button>
        ) : null}
      </div>
      <Stack gap={6}>
        <Stack orientation="horizontal" gap={7} className={styles.row}>
          <TextInput
            defaultValue={context}
            helperText="The top level property from your context to evaluate against. No whitespace allowed."
            id={`${position}-context`}
            labelText="Context"
            name="context"
            pattern="\w*"
            readOnly={disabled}
            required
          />
          <TextInput
            defaultValue={attribute}
            helperText="Nested attributes can be accessed via dot notation (ex. address.city). No whitespace allowed."
            id={`${position}-attribute`}
            labelText="Attribute"
            name="attribute"
            pattern="\w+(\.\w+)*"
            readOnly={disabled}
          />
        </Stack>
        <Stack orientation="horizontal" gap={7} className={styles.row}>
          <Select
            className={styles.column}
            defaultValue={operator}
            id="operator"
            labelText="Operator"
            name="operator"
            readOnly={disabled}
            required
          >
            {operators.map(([value, label]) => (
              <SelectItem value={value} text={label} key={value} />
            ))}
          </Select>
          <TextInput
            className={styles.column}
            defaultValue={values}
            helperText="Values should be comma separated if more than one (ex. value1, value2)."
            id="values"
            labelText="Values"
            name="values"
            readOnly={disabled}
            required
            type="text"
          />
        </Stack>
      </Stack>
      <input type="hidden" name="clause" value={position ? RuleConditional.And : RuleConditional.If} />
    </div>
  );
}
