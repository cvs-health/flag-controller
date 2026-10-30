// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useActionState } from 'react';
import {
  Button,
  ComposedModal,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@carbon/react';

import removeTeamMember, { type RemoveTeamMemberActionState } from '../../actions/removeTeamMember';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';
import { ActionStatus } from '../../typings/common';
import styles from './RemoveMemberModal.module.scss';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface RemoveMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member;
  teamId: string;
}

const initialActionState: RemoveTeamMemberActionState = {
  form: { userId: '', teamId: '' },
  status: ActionStatus.Idle,
};

export function RemoveMemberModal({ open, onClose, member, teamId, onSuccess }: RemoveMemberModalProps) {
  const [formState, formAction] = useActionState(removeTeamMember, initialActionState);

  return (
    <form name="removeMemberModal" action={formAction}>
      <ComposedModal aria-label="Remove member modal" open={open} onClose={onClose} preventCloseOnClickOutside>
        <ModalHeader title="Are you sure you want to remove this member?" className={styles.header} />
        <ModalBody>
          {formState.errors?.actionError && (
            <InlineNotification
              kind="error"
              title={formState.errors.actionError.title}
              subtitle={formState.errors.actionError.subtitle}
              className={styles.notification}
            />
          )}
          <TextInput id="memberName" name="memberName" labelText="Member name" value={member.name} size="lg" readOnly />
          <TextInput
            id="memberEmail"
            name="memberEmail"
            labelText="Member email"
            value={member.email}
            size="lg"
            readOnly
            className={styles.emailInput}
          />
          <input type="hidden" name="userId" value={member.id} />
          <input type="hidden" name="teamId" value={teamId} />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            label="Yes, remove member"
            kind="danger"
            status={formState.status}
            variant={SubmitButtonVariant.Full}
            onSubmitDone={onSuccess}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
