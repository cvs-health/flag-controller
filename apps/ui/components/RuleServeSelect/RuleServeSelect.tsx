// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { ChangeEvent } from 'react';
import { Select, SelectItem } from '@carbon/react';
import type { FlagVariationsTableColumns } from 'shared-types';

import { WEIGHTED_ROLLOUT_ID } from '../../constants/rules';

interface RuleServeSelectProps {
  defaultVariationOnly?: boolean;
  variationId: string | null;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  variations: FlagVariationsTableColumns[];
  fractionalId?: string;
}

export function RuleServeSelect({
  defaultVariationOnly = false,
  variationId,
  onChange = () => {},
  variations,
  fractionalId = WEIGHTED_ROLLOUT_ID,
}: RuleServeSelectProps) {
  return (
    <Select
      defaultValue={variationId || fractionalId || ''}
      helperText="Visit the variations tab to edit or create variations"
      id={defaultVariationOnly ? 'defaultVariationId' : 'serveId'}
      labelText="Serve"
      name={defaultVariationOnly ? 'defaultVariationId' : 'serveId'}
      onChange={onChange}
      required
    >
      {variations.map((variation) => (
        <SelectItem value={variation.id} text={variation.key} key={variation.id} />
      ))}
      {!defaultVariationOnly ? <SelectItem text="Weighted rollout" value={fractionalId} /> : null}
    </Select>
  );
}
