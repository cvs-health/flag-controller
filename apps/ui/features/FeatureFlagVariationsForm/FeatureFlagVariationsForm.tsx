// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { lowercaseKebabCasePattern } from '../../constants/common';
import { FeatureFlagType, type FlagVariationsTableColumns } from 'shared-types';
import { Activity, startTransition, useActionState, useEffect, useMemo, useState } from 'react';

import revalidatePage from '../../utils/revalidatePage';
import styles from './FeatureFlagVariationsForm.module.scss';
import type { UpdatedVariation } from '../../typings/variations';
import updateFeatureFlagVariations from '../../actions/updateFeatureFlagVariations';
import validateFeatureFlagVariations from '../../utils/validateFeatureFlagVariations';
import { Button, InlineNotification, Stack, TextInput } from '../../components/Carbon';
import { FormAction, ActionStatus } from '../../typings/common';
import { JSONInput } from '../../components/JSONInput/JSONInput';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { SubtractAlt } from '@carbon/icons-react';

interface FeatureFlagVariationsFormProps {
  applicationName: string;
  featureFlagArchived?: boolean;
  featureFlagKey: string;
  featureFlagType?: FeatureFlagType;
  existingVariations: FlagVariationsTableColumns[];
  featureFlagId: string;
}

export function FeatureFlagVariationsForm({
  applicationName,
  existingVariations,
  featureFlagArchived = false,
  featureFlagKey,
  featureFlagType,
  featureFlagId,
}: FeatureFlagVariationsFormProps) {
  const initialState = {
    errorMessage: '',
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState(updateFeatureFlagVariations, initialState);
  const objectType = featureFlagType === FeatureFlagType.Object;
  const [variations, setVariations] = useState<UpdatedVariation[]>(
    existingVariations.reduce<UpdatedVariation[]>((accumulator, variation) => {
      const value = objectType ? JSON.stringify(variation.value, null, 2) : variation.value.toString();
      return [...accumulator, { ...variation, value }];
    }, []),
  );
  const removedVariationsById = variations.reduce<string[]>(
    (removedVariations, variation) => (variation.removed ? [...removedVariations, variation.id] : removedVariations),
    [],
  );
  const booleanFeatureFlagType = featureFlagType === FeatureFlagType.Boolean;
  const valueType = featureFlagType === FeatureFlagType.Integer ? 'number' : 'text';
  const errors = useMemo(() => {
    if (featureFlagType) {
      return validateFeatureFlagVariations(variations, featureFlagType);
    }

    return {};
  }, [featureFlagType, variations]);

  const removeDisabled = variations.length <= 2;
  const submitDisabled = !!Object.keys(errors).length;

  function handleAddVariation() {
    setVariations([
      ...variations,
      { key: `new-variation-${variations.length + 1}`, value: '', created: true, id: Math.random().toString() },
    ]);
  }

  function handleKeyBlur(id: string, key: string) {
    const updatedVariations = variations.map((variation) => (variation.id === id ? { ...variation, key } : variation));

    setVariations(updatedVariations);
  }

  function handleValueChange(id: string, value: string) {
    const updatedVariations = variations.map((variation) =>
      variation.id === id ? { ...variation, value } : variation,
    );

    setVariations(updatedVariations);
  }

  function handleRemoveVariation(id: string) {
    const updatedVariations = variations.flatMap((variation) => {
      if (variation.id === id) {
        // Filter out variations queued to be created
        return variation.created ? [] : [{ ...variation, removed: true }];
      }
      return [variation];
    });

    setVariations(updatedVariations);
  }

  useEffect(() => {
    if (formState.status === ActionStatus.Success) {
      startTransition(() => {
        formAction(FormAction.ResetStatus);
        revalidatePage();
      });
    }
  }, [formState.status, formAction]);

  return (
    <form action={formAction} name="featureFlagVariations">
      <div className={classNames(styles.actions, booleanFeatureFlagType && styles.saveOnly)}>
        {!booleanFeatureFlagType && (
          <Button disabled={featureFlagArchived} kind="tertiary" onClick={handleAddVariation}>
            Add variation
          </Button>
        )}
        <SubmitButton label="Save" disabled={submitDisabled} status={formState.status} />
      </div>
      {formState.status === ActionStatus.Error ? (
        <InlineNotification className={styles.error} subtitle={formState.errorMessage} title="Failed to save changes" />
      ) : null}
      <Stack gap={6}>
        {variations.map(({ key, value, id, created, removed }) => (
          <Activity key={key} mode={removedVariationsById.includes(id) ? 'hidden' : 'visible'}>
            <div className={styles.variationContainer}>
              <Stack orientation="vertical" gap={7}>
                <TextInput
                  defaultValue={key}
                  helperText="Format should follow a lowercase, kebab-case convention (ex. my-variation)"
                  id={`key-${id}`}
                  labelText="Key"
                  name="key"
                  onBlur={(event) => handleKeyBlur(id, event.target.value)}
                  pattern={lowercaseKebabCasePattern.source}
                  placeholder="my-variation"
                  readOnly={featureFlagArchived}
                  required
                  type="text"
                />
                {objectType ? (
                  <JSONInput
                    defaultValue={value}
                    id={`value-${id}`}
                    invalid={!!errors[id]}
                    invalidText={errors[id]}
                    labelText="Value"
                    name="value"
                    onChange={(updatedValue) => handleValueChange(id, updatedValue)}
                    helperText={'Enter a valid JSON object (e.g., { "key": "value" })'}
                    // readOnly rather than disabled so the value is still included in the submitted form data
                    readOnly={featureFlagArchived}
                  />
                ) : (
                  <TextInput
                    defaultValue={value}
                    helperText={booleanFeatureFlagType ? 'Boolean variation values cannot be changed' : undefined}
                    id={`value-${id}`}
                    invalid={!!errors[id]}
                    invalidText={errors[id]}
                    labelText="Value"
                    name="value"
                    onBlur={(event) => handleValueChange(id, event.target.value)}
                    // readOnly rather than disabled so the value is still included in the submitted form data
                    readOnly={featureFlagArchived || booleanFeatureFlagType}
                    required
                    type={valueType}
                  />
                )}
                <Button
                  disabled={removeDisabled}
                  kind="danger--ghost"
                  onClick={() => handleRemoveVariation(id)}
                  size="md"
                  className={styles.remove}
                  renderIcon={SubtractAlt}
                >
                  Remove variation
                </Button>
                <input type="hidden" name="id" value={id} readOnly />
                <input type="hidden" name="created" value={String(created ?? 'false')} readOnly />
                <input type="hidden" name="removed" value={String(removed ?? 'false')} readOnly />
              </Stack>
            </div>
          </Activity>
        ))}
      </Stack>
      <input type="hidden" name="applicationName" value={applicationName} readOnly />
      <input type="hidden" name="featureFlagId" value={featureFlagId} readOnly />
      <input type="hidden" name="featureFlagKey" value={featureFlagKey} readOnly />
      <input type="hidden" name="featureFlagType" value={featureFlagType || ''} readOnly />
      <input type="hidden" name="variations" value={JSON.stringify(existingVariations)} readOnly />
    </form>
  );
}
