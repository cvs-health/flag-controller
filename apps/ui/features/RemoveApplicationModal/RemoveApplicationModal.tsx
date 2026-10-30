// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useActionState } from 'react';

import {
  Button,
  ComposedModal,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
} from '../../components/Carbon';
import removeApplication, { type RemoveApplicationActionState } from '../../actions/removeApplication';
import styles from './RemoveApplicationModal.module.scss';
import { ActionStatus } from '../../typings/common';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';

interface RemoveApplicationModalProps {
  applicationId: string;
  applicationName: string;
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
}

export function RemoveApplicationModal({
  open,
  onClose,
  onSuccess,
  applicationName,
  applicationId,
}: RemoveApplicationModalProps) {
  const initialActionState: RemoveApplicationActionState = {
    form: {
      applicationName,
      applicationId,
    },
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState(removeApplication, initialActionState);

  return (
    <form name="removeApplicationModal" action={formAction}>
      <ComposedModal open={open} onClose={onClose} id="removeApplicationModal">
        <ModalHeader title="Remove application" className={styles.header}>
          <p className={styles.description}>
            <b>NOTE:</b> Removing an application removes all flags and segments connected to that application.
          </p>
        </ModalHeader>
        <ModalBody>
          {formState.errors?.actionError ? (
            <InlineNotification
              className={styles.notification}
              kind="error"
              title={formState.errors.actionError.title}
              subtitle={formState.errors.actionError.subtitle}
            />
          ) : null}
          <Stack gap={6} className={styles.inputs}>
            <TextInput
              defaultValue={formState.form.applicationName}
              id="applicationName"
              invalid={!!formState.errors?.fieldErrors?.applicationName}
              invalidText={formState.errors?.fieldErrors?.applicationName?.join(' ')}
              labelText="Application name"
              name="applicationName"
              placeholder="my-app-name"
              readOnly
              size="lg"
            />
            <input type="hidden" name="applicationId" value={applicationId} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            kind="danger"
            label="Remove application"
            status={formState.status}
            variant={SubmitButtonVariant.Full}
            onSubmitDone={onSuccess}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
