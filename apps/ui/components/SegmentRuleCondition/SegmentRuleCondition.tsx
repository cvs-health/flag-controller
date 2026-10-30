// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import classNames from 'classnames';
import { Clause, RuleConditionType, type Operator, type SegmentsTableColumns } from 'shared-types';
import { Button, Select, SelectItem, Stack } from '@carbon/react';
import { SubtractAlt } from '@carbon/icons-react';
import { z } from 'zod';

import styles from './SegmentRuleCondition.module.scss';
import type { SegmentRuleConditional } from '../../typings/rules';
import { segmentOperatorTranslation, segmentRuleConditionalTranslation } from '../../constants/common';
import getRuleConditionFieldId from '../../utils/getRuleConditionFieldId';
import useInputValidation from '../../hooks/useInputValidation';

interface SegmentRuleConditionProps {
  id: string;
  className?: string;
  conditional: SegmentRuleConditional;
  disabled?: boolean;
  onRemove: (id: string) => void;
  operator: Operator;
  position: number;
  ruleId: string;
  segmentId: string;
  segments: SegmentsTableColumns[];
}

export function SegmentRuleCondition({
  className = '',
  conditional,
  disabled = false,
  id,
  onRemove,
  operator,
  position,
  ruleId,
  segmentId,
  segments,
}: SegmentRuleConditionProps) {
  const inputValidation = useInputValidation({
    schema: z.string().min(1, 'Segment is required.'),
  });
  const operatorId = getRuleConditionFieldId(id, position, 'operator');

  return (
    <div className={classNames(styles.root, className)}>
      <Stack gap={5}>
        <div className={styles.conditional}>
          {segmentRuleConditionalTranslation[conditional]}
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
        <Select
          defaultValue={operator}
          id={operatorId}
          labelText="Operator"
          name={`${id}-operator`}
          readOnly={disabled}
          required
        >
          {Object.entries(segmentOperatorTranslation).map(([value, label]) => (
            <SelectItem value={value} text={label} key={value} />
          ))}
        </Select>
        <Select
          defaultValue={segmentId}
          id={`${ruleId}-${segmentId}`}
          invalid={!!inputValidation.error || !segments.length}
          invalidText={
            inputValidation.error ||
            (!segments.length
              ? 'No segments available. Create or add conditions to an existing segment for this application in order to update this rule.'
              : '')
          }
          helperText="Only segments with defined conditions are shown."
          labelText="Segment"
          name={`${id}-segmentId`}
          readOnly={disabled}
          onBlur={inputValidation.handleBlur}
          onChange={inputValidation.handleChange}
          onInvalid={inputValidation.handleInvalid}
          required
        >
          {segments.map((segment) => (
            <SelectItem value={segment.id} text={segment.key} key={segment.id} />
          ))}
        </Select>
      </Stack>
      <input type="hidden" name={`${id}-clause`} value={Clause.And} />
      <input type="hidden" name={`${id}-conditionType`} value={RuleConditionType.Segment} />
      <input type="hidden" name={`${ruleId}-conditionId`} value={id} />
    </div>
  );
}
