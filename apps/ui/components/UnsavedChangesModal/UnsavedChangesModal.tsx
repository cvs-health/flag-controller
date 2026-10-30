// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import type { MouseEventHandler, ReactNode } from 'react';

import type { ActionStatus } from '../../typings/common';
import { SubmitButton, SubmitButtonVariant } from '../SubmitButton/SubmitButton';

type PrimaryActionHandler = (data: FormData) => void;

interface UnsavedChangesModalProps {
  body: ReactNode;
  onClose: () => void;
  onPrimaryAction: PrimaryActionHandler | MouseEventHandler<HTMLButtonElement>;
  onPrimaryActionDone?: () => void;
  onSecondaryAction: () => void;
  open: boolean;
  primaryActionLabel: string;
  primaryActionStatus: ActionStatus;
  primaryActionType?: 'button' | 'submit';
  secondaryActionLabel: string;
  title: string;
}

export function UnsavedChangesModal({
  body,
  onClose,
  onPrimaryAction,
  onPrimaryActionDone,
  onSecondaryAction,
  open,
  primaryActionLabel,
  primaryActionStatus,
  primaryActionType = 'submit',
  secondaryActionLabel,
  title,
}: UnsavedChangesModalProps) {
  return (
    <ComposedModal
      aria-label="Unsaved changes modal"
      id="unsavedChangesModal"
      onClose={onClose}
      open={open}
      preventCloseOnClickOutside
      size="sm"
    >
      <ModalHeader title={title} />
      <ModalBody>{body}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onSecondaryAction}>
          {secondaryActionLabel}
        </Button>
        {primaryActionType === 'submit' ? (
          <SubmitButton
            label={primaryActionLabel}
            status={primaryActionStatus}
            onSubmitDone={onPrimaryActionDone}
            variant={SubmitButtonVariant.Full}
            formAction={onPrimaryAction as PrimaryActionHandler}
          />
        ) : (
          <Button type="button" onClick={onPrimaryAction as MouseEventHandler<HTMLButtonElement>}>
            {primaryActionLabel}
          </Button>
        )}
      </ModalFooter>
    </ComposedModal>
  );
}
