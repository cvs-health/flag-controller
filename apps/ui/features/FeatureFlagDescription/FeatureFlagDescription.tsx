// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Edit } from '@carbon/icons-react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import styles from './FeatureFlagDescription.module.scss';
import updateFeatureFlagDetails, { type UpdateFeatureFlagDetailsState } from '../../actions/updateFeatureFlagDetails';
import useInputValidation from '../../hooks/useInputValidation';
import { Form, IconButton, InlineNotification, TextArea } from '../../components/Carbon';
import { updateFeatureFlagDetailsSchema } from '../../schemas/updateDetails';
import { ActionStatus } from '../../typings/common';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';

interface FeatureFlagDescriptionProps {
  className?: string;
  description: string;
  featureFlagId: string;
  readOnly?: boolean;
}

export function FeatureFlagDescription({
  className = '',
  description,
  featureFlagId,
  readOnly = true,
}: FeatureFlagDescriptionProps) {
  const initialState: UpdateFeatureFlagDetailsState = {
    status: ActionStatus.Idle,
    form: {
      description,
      featureFlagId,
    },
  };
  const [editing, setEditing] = useState(false);
  const [formState, formAction] = useActionState(updateFeatureFlagDetails, initialState);
  const descriptionInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.description,
    schema: updateFeatureFlagDetailsSchema.shape.description,
  });

  function handleEdit() {
    setEditing(true);
  }

  function handleSubmitDone() {
    setEditing(false);
  }

  // Reset the form status on success
  useEffect(() => {
    if (formState.status === ActionStatus.Success) {
      startTransition(() => {
        formAction();
      });
    }
  }, [formState.status, formAction]);

  return (
    <Form action={formAction} name="feature-flag-description" className={className}>
      <div className={styles.description}>
        <TextArea
          defaultValue={formState.form.description || description}
          enableCounter
          id="description"
          invalid={!!descriptionInputValidation.error}
          invalidText={descriptionInputValidation.error}
          labelText="Flag description"
          name="description"
          onBlur={descriptionInputValidation.handleBlur}
          onChange={descriptionInputValidation.handleChange}
          onInvalid={descriptionInputValidation.handleInvalid}
          placeholder=""
          readOnly={!editing || readOnly}
          required
          rows={5}
        />
        {!readOnly && !editing ? (
          <IconButton label="Edit description" kind="ghost" onClick={handleEdit} disabled={editing}>
            <Edit />
          </IconButton>
        ) : null}
        {!readOnly && editing ? (
          <SubmitButton label="Save" onSubmitDone={handleSubmitDone} size="sm" status={formState.status} kind="ghost" />
        ) : null}
      </div>
      {formState.errors?.actionError ? (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="error"
          subtitle={formState.errors.actionError.subtitle}
          title={formState.errors.actionError.title}
        />
      ) : null}
      <input type="hidden" name="featureFlagId" value={featureFlagId} readOnly />
    </Form>
  );
}
