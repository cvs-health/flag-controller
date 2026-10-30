// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useActionState, useState } from 'react';
import { Button, ComposedModal, InlineNotification, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';

import archiveFeatureFlag, { type ArchiveFeatureFlagReturn } from '../../actions/archiveFeatureFlag';
import styles from './ArchiveFeatureFlagModal.module.scss';
import { ActionStatus } from '../../typings/common';
import { environmentLabels } from '../../constants/common';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';

const environmentNames = Object.values(environmentLabels).join(' and ');

export interface ArchiveFeatureFlagFormData {
  applicationId: string;
  featureFlagId: string;
}

interface ArchiveFeatureFlagProps {
  applicationId: string;
  featureFlagKey: string;
  children: (onOpen: () => void) => React.ReactNode;
  featureFlagId: string;
  onSuccess: () => void;
}

export function ArchiveFeatureFlagModal({
  applicationId,
  featureFlagId,
  featureFlagKey,
  children,
  onSuccess,
}: ArchiveFeatureFlagProps) {
  const [open, setOpen] = useState(false);
  const initialState = {
    applicationId,
    featureFlagId,
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState<ArchiveFeatureFlagReturn<ArchiveFeatureFlagFormData>, FormData>(
    archiveFeatureFlag,
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
        <ComposedModal open={open} onClose={handleToggleModal} id="archiveFeatureFlag">
          <ModalHeader title="Archive Flag" />
          <ModalBody>
            <p>
              You are about to archive <strong className={styles.bold}>"{featureFlagKey}"</strong>.
            </p>
            <p className={styles.heading}>
              <strong className={styles.bold}>This will:</strong>
            </p>
            <ul className={styles.list}>
              <li>Turn off this flag in all environments ({environmentNames}), regardless of current state</li>
              <li>Archive the flag so it is no longer active</li>
            </ul>
            <p className={styles.note}>
              You can restore the flag later, but it will remain off in all environments until you toggle it back on.
            </p>
            {formState.errors?.actionError ? (
              <InlineNotification
                className={styles.error}
                hideCloseButton
                subtitle={formState.errors.actionError.subtitle}
                title={formState.errors.actionError.title}
              />
            ) : null}
            <input type="hidden" name="applicationId" value={applicationId} readOnly />
            <input type="hidden" name="featureFlagId" value={featureFlagId} readOnly />
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={handleToggleModal}>
              Cancel
            </Button>
            <SubmitButton
              kind="danger"
              label="Archive and turn off"
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
