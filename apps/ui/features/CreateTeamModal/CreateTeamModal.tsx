// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useActionState } from 'react';

import createTeam, { type CreateTeamActionState } from '../../actions/createTeam';
import useInputValidation from '../../hooks/useInputValidation';
import { createTeamSchema } from '../../schemas/createTeam';
import styles from './CreateTeamModal.module.scss';
import { ActionStatus } from '../../typings/common';
import {
  Button,
  ComposedModal,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '../../components/Carbon';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';
import { lowercaseKebabCasePattern } from '../../constants/common';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (teamName: string) => void;
}

const initialActionState: CreateTeamActionState = {
  form: {
    teamName: '',
  },
  status: ActionStatus.Idle,
};

export function CreateTeamModal({ open, onClose, onSuccess }: CreateTeamModalProps) {
  const [formState, formAction] = useActionState(createTeam, initialActionState);
  const teamNameInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.teamName,
    schema: createTeamSchema.shape.teamName,
  });

  function handleSubmitDone() {
    onSuccess(formState.form.teamName);
  }

  return (
    <form name="createTeamModal" action={formAction}>
      <ComposedModal open={open} onClose={onClose} id="createTeamModal">
        <ModalHeader title="Create team" className={styles.header}>
          <p className={styles.description}>After you create a team, you can add members on the Team detail page.</p>
        </ModalHeader>
        <ModalBody>
          {formState.errors?.actionError && (
            <InlineNotification
              className={styles.notification}
              hideCloseButton
              kind="error"
              subtitle={formState.errors.actionError.subtitle}
              title={formState.errors.actionError.title}
            />
          )}
          <TextInput
            helperText="Provide a unique team name. Team name cannot be changed later."
            data-modal-primary-focus
            id="teamName"
            invalid={!!teamNameInputValidation.error}
            invalidText={teamNameInputValidation.error}
            labelText="Team name"
            name="teamName"
            onBlur={teamNameInputValidation.handleBlur}
            onChange={teamNameInputValidation.handleChange}
            onInvalid={teamNameInputValidation.handleInvalid}
            pattern={lowercaseKebabCasePattern.source}
            placeholder="my-team-name"
            defaultValue={formState.form.teamName}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            label={formState.status === ActionStatus.Success ? 'Team created' : 'Create team'}
            onSubmitDone={handleSubmitDone}
            status={formState.status}
            variant={SubmitButtonVariant.Full}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
