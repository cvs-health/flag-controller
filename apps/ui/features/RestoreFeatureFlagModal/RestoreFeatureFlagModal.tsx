// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Button, ComposedModal, InlineNotification, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useActionState, useState } from 'react';

import restoreFeatureFlag, { type RestoreFeatureFlagReturn } from '../../actions/restoreFeatureFlag';
import styles from './RestoreFeatureFlagModal.module.scss';
import { ActionStatus } from '../../typings/common';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';

export interface RestoreFeatureFlagFormData {
  applicationName: string;
  featureFlagId: string;
}

interface RestoreFeatureFlagProps {
  applicationName: string;
  featureFlagKey: string;
  featureFlagId: string;
  onSuccess: () => void;
  children: (onOpen: () => void) => React.ReactNode;
}

export function RestoreFeatureFlagModal({
  applicationName,
  featureFlagKey,
  featureFlagId,
  children,
  onSuccess,
}: RestoreFeatureFlagProps) {
  const [open, setOpen] = useState(false);
  const initialState = {
    applicationName,
    featureFlagId,
    featureFlagKey,
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState<RestoreFeatureFlagReturn<RestoreFeatureFlagFormData>, FormData>(
    restoreFeatureFlag,
    initialState,
  );

  function handleToggleModal() {
    setOpen(!open);
  }

  function handleSubmitDone() {
    onSuccess();
    setOpen(false);
  }

  return (
    <>
      <form action={formAction}>
        <ComposedModal open={open} onClose={handleToggleModal} id="restoreFeatureFlag">
          <ModalHeader title="Restore Flag" />
          <ModalBody>
            <p>You are about to restore '{featureFlagKey}'. Are you sure you would like to restore it?</p>
            {formState.errors?.actionError ? (
              <InlineNotification
                className={styles.error}
                hideCloseButton
                subtitle={formState.errors.actionError.subtitle}
                title={formState.errors.actionError.title}
              />
            ) : null}
            <input type="hidden" name="applicationName" value={applicationName} readOnly />
            <input type="hidden" name="featureFlagId" value={featureFlagId} readOnly />
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={handleToggleModal}>
              Cancel
            </Button>
            <SubmitButton
              label="Restore flag"
              onSubmitDone={handleSubmitDone}
              status={formState.status}
              variant={SubmitButtonVariant.Full}
            />
          </ModalFooter>
        </ComposedModal>
      </form>
      {children(handleToggleModal)}
    </>
  );
}
