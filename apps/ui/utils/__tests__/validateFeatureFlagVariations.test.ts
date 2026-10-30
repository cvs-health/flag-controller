// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { FeatureFlagType } from 'shared-types';
import { describe, expect, it } from 'vitest';

import validateFeatureFlagVariations from '../validateFeatureFlagVariations';
import type { UpdatedVariation } from '../../typings/variations';

describe('validateFeatureFlagVariations', () => {
  it('should return no errors for empty or populated object variations', () => {
    const variations: UpdatedVariation[] = [
      { id: 'variation-id', key: 'empty', value: '{}' },
      { id: 'variation-id-2', key: 'populated', value: '{"enabled": true}' },
    ];

    const result = validateFeatureFlagVariations(variations, FeatureFlagType.Object);

    expect(result).toEqual({});
  });

  it('should return errors for values that are not objects', () => {
    const variations: UpdatedVariation[] = [
      { id: 'variation-null', key: 'null', value: 'null' },
      { id: 'variation-array', key: 'array', value: '[]' },
      { id: 'variation-primitive', key: 'primitive', value: 'true' },
      { id: 'variation-invalid', key: 'invalid', value: 'not valid json' },
      { id: 'variation-valid', key: 'valid', value: '{"enabled": false}' },
    ];

    const result = validateFeatureFlagVariations(variations, FeatureFlagType.Object);

    expect(result).toEqual({
      'variation-null': 'Must be a valid JSON object.',
      'variation-array': 'Must be a valid JSON object.',
      'variation-primitive': 'Must be a valid JSON object.',
      'variation-invalid': 'Must be a valid JSON object.',
    });
  });

  it('does not object-validate non-object feature flag types', () => {
    const variations: UpdatedVariation[] = [
      { id: 'variation-id', key: 'on', value: '{"enabled": true}' },
      { id: 'variation-id-2', key: 'off', value: '{"enabled": false}' },
    ];

    const result = validateFeatureFlagVariations(variations, FeatureFlagType.String);

    expect(result).toEqual({});
  });
});
