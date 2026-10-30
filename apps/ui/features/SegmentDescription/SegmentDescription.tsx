// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';
import { Edit } from '@carbon/icons-react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import updateSegmentDetails, { type UpdateSegmentDetailsState } from '../../actions/updateSegmentDetails';
import useInputValidation from '../../hooks/useInputValidation';
import { Button, Form, InlineNotification, TextArea } from '../../components/Carbon';
import { updateSegmentDetailsSchema } from '../../schemas/updateDetails';
import { SubmitButton } from '../../components/SubmitButton/SubmitButton';
import { ActionStatus } from '../../typings/common';
import styles from './SegmentDescription.module.scss';

interface SegmentDescriptionProps {
  description: string;
  readOnly?: boolean;
  segmentId: string;
}

export function SegmentDescription({ description, readOnly = true, segmentId }: SegmentDescriptionProps) {
  const initialState: UpdateSegmentDetailsState = {
    status: ActionStatus.Idle,
    form: {
      description,
      segmentId,
    },
  };
  const [editing, setEditing] = useState(false);
  const [formState, formAction] = useActionState(updateSegmentDetails, initialState);
  const descriptionInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.description,
    schema: updateSegmentDetailsSchema.shape.description,
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
    <Form action={formAction} name="segment-description" className={styles.root}>
      <TextArea
        enableCounter
        id="description"
        invalid={!!descriptionInputValidation.error}
        invalidText={descriptionInputValidation.error}
        name="description"
        onBlur={descriptionInputValidation.handleBlur}
        onChange={descriptionInputValidation.handleChange}
        onInvalid={descriptionInputValidation.handleInvalid}
        labelText="Description"
        placeholder=""
        defaultValue={formState.form.description || description}
        required
        rows={2}
        readOnly={!editing || readOnly}
        className={styles.textArea}
      />
      {formState.errors?.actionError ? (
        <InlineNotification
          className={styles.notification}
          hideCloseButton
          kind="error"
          subtitle={formState.errors.actionError.subtitle}
          title={formState.errors.actionError.title}
        />
      ) : null}
      {!readOnly && (
        <div className={styles.actions}>
          <Button size="sm" onClick={handleEdit} renderIcon={Edit} kind="ghost" disabled={editing}>
            Edit segment description
          </Button>
          {editing && (
            <SubmitButton
              label="Save description"
              status={formState.status}
              size="lg"
              onSubmitDone={handleSubmitDone}
            />
          )}
        </div>
      )}
      <input type="hidden" name="segmentId" value={segmentId} readOnly />
    </Form>
  );
}
