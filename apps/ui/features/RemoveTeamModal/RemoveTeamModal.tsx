// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useActionState } from 'react';
import type { Team } from 'better-auth/plugins';

import removeTeam, { type RemoveTeamActionState } from '../../actions/removeTeam';
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
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';
import styles from './RemoveTeamModal.module.scss';
import { ActionStatus } from '../../typings/common';

interface RemoveTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team: Pick<Team, 'id' | 'name'>;
}

export function RemoveTeamModal({ open, onClose, onSuccess, team }: RemoveTeamModalProps) {
  const initialActionState: RemoveTeamActionState = {
    form: {
      teamId: team.id,
      teamName: team.name,
    },
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState(removeTeam, initialActionState);
  const submitLabels = {
    [ActionStatus.Success]: 'Team removed',
    [ActionStatus.Pending]: 'Removing team',
    [ActionStatus.Idle]: 'Remove team',
  };

  return (
    <form name="removeTeamModal" action={formAction}>
      <ComposedModal open={open} onClose={onClose} id="removeTeamModal">
        <ModalHeader title="Remove team" className={styles.header}>
          <p className={styles.description}>
            You can only remove a team if it has no applications. Remove applications on the Applications page.
          </p>
        </ModalHeader>
        <ModalBody>
          {formState.errors?.actionError ? (
            <InlineNotification
              className={styles.notification}
              hideCloseButton
              kind="error"
              subtitle={formState.errors.actionError.subtitle}
              title={formState.errors.actionError.title}
            />
          ) : null}
          <Stack gap={6} className={styles.inputs}>
            <TextInput id="teamName" name="teamName" labelText="Team name" value={team.name} readOnly />
            <input type="hidden" name="teamId" value={team.id} readOnly />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            kind="danger"
            label={submitLabels}
            onSubmitDone={onSuccess}
            status={formState.status}
            variant={SubmitButtonVariant.Full}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
