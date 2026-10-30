// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagVariationsTableColumns, FractionalWeight } from 'shared-types';
import { type FocusEvent, useState } from 'react';

import weightsDistributionFromExistingWeights from '../../utils/weightsDistributionFromExistingWeights';
import styles from './WeightRollout.module.scss';
import { NumberInput, Stack, TextInput } from '../../components/Carbon';

interface WeightRolloutProps {
  weights?: FractionalWeight[];
  ruleOrderPosition?: number;
  variations: FlagVariationsTableColumns[];
  varValue?: string | null;
}

const NO_WHITESPACE_PATTERN = /^\w*$/;
const ATTRIBUTE_PATTERN = /^\w+(\.\w+)*$/;

export function WeightRollout({ varValue = '', weights = [], ruleOrderPosition, variations }: WeightRolloutProps) {
  const rolloutWeights = weightsDistributionFromExistingWeights(variations, weights);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [context = '', attribute = ''] = (varValue ?? '').split('.');

  function handleAttributeBlur(event: FocusEvent<HTMLInputElement>) {
    const value = event.target.value.trim();

    setFieldErrors((prev) => {
      if (value && !ATTRIBUTE_PATTERN.test(value)) {
        return {
          ...prev,
          attribute: 'Attribute must follow valid dot notation (ex. address.city). No whitespace allowed.',
        };
      }
      const { attribute: _, ...rest } = prev;
      return rest;
    });
  }

  function handleContextBlur(event: FocusEvent<HTMLInputElement>) {
    const value = event.target.value.trim();

    setFieldErrors((prev) => {
      if (!NO_WHITESPACE_PATTERN.test(value)) {
        return { ...prev, context: 'Context must not contain whitespace.' };
      }
      const { context: _, ...rest } = prev;
      return rest;
    });
  }

  return (
    <Stack gap={6}>
      <Stack gap={7} orientation="horizontal" className={styles.row}>
        {variations.map((variation, index) => (
          <NumberInput
            defaultValue={rolloutWeights[index]?.[1]}
            id={`${ruleOrderPosition}-rule-rollout-variation-${variation.id}`}
            key={`${ruleOrderPosition}-rule-rollout-variation-${variation.id}`}
            label={variation.key}
            max={100}
            min={0}
            name={`${ruleOrderPosition}-rule-rollout-variation-${variation.id}`}
          />
        ))}
      </Stack>
      <Stack gap={7} orientation="horizontal" className={styles.row}>
        <TextInput
          defaultValue={context}
          helperText="The top level property from your context. No whitespace allowed."
          id={`${ruleOrderPosition}-rule-rollout-context`}
          invalid={!!fieldErrors.context}
          invalidText={fieldErrors.context}
          name={`${ruleOrderPosition}-rule-rollout-context`}
          onBlur={handleContextBlur}
          labelText="Context"
        />
        <TextInput
          defaultValue={attribute}
          helperText="Nested attributes can be accessed via dot notation (ex. address.city). No whitespace allowed."
          id={`${ruleOrderPosition}-rule-rollout-attribute`}
          invalid={!!fieldErrors.attribute}
          invalidText={fieldErrors.attribute}
          name={`${ruleOrderPosition}-rule-rollout-attribute`}
          onBlur={handleAttributeBlur}
          labelText="Attribute"
        />
      </Stack>
    </Stack>
  );
}
