// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useActionState, useState } from 'react';
import type { TeamsTableColumns } from 'shared-types';

import createApplication, { type CreateApplicationActionState } from '../../actions/createApplication';
import useInputValidation from '../../hooks/useInputValidation';
import {
  Button,
  ComboBox,
  ComposedModal,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
  type OnChangeData,
} from '../../components/Carbon';
import styles from './CreateApplicationModal.module.scss';
import useGetUserTeamsQuery from '../../api/queries/useGetUserTeamsQuery';
import { ActionStatus } from '../../typings/common';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';
import { authClient } from '../../lib/auth-client';
import { createApplicationSchema } from '../../schemas/createApplication';
import { lowercaseKebabCasePattern } from '../../constants/common';

interface CreateApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (applicationName: string) => void;
}

const initialActionState: CreateApplicationActionState = {
  form: {
    applicationName: '',
    teamId: '',
  },
  status: ActionStatus.Idle,
};

export function CreateApplicationModal({ open, onClose, onSuccess }: CreateApplicationModalProps) {
  const session = authClient.useSession();
  const getUserTeamsQuery = useGetUserTeamsQuery(session.data?.user.id || '');
  const [formState, formAction] = useActionState(createApplication, initialActionState);
  // Carbon's ComboBox does not have a native way to set the input's value based on a selection change so we need to manage it ourselves.
  const [selectedTeamId, setSelectedTeamId] = useState(formState.form.teamId);
  const submitLabels = {
    [ActionStatus.Success]: 'Application created',
    [ActionStatus.Pending]: 'Creating application',
    [ActionStatus.Idle]: 'Create application',
    [ActionStatus.Error]: 'Error creating application',
  };
  const applicationNameInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.applicationName,
    schema: createApplicationSchema.shape.applicationName,
  });
  const teamInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.teamId,
  });

  function handleChangeTeam(change: OnChangeData<Pick<TeamsTableColumns, 'id' | 'name'> | undefined>) {
    setSelectedTeamId(change.selectedItem?.id || '');
  }

  function handleSubmitDone() {
    onSuccess(formState.form.applicationName);
  }

  return (
    <form name="createApplicationModal" action={formAction}>
      <ComposedModal open={open} onClose={onClose} id="createApplicationModal">
        <ModalHeader title="Create application" className={styles.header}>
          <p className={styles.description}>After you create an application, you can add flags from the Flags table.</p>
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
          <Stack gap={6} className={styles.inputs}>
            <TextInput
              data-modal-primary-focus
              defaultValue={formState.form.applicationName}
              helperText="Permanent, unique identifier. Use lowercase kebab‑case (letters, numbers, hyphens only), for example: my-application-name. No spaces. This can’t be changed later."
              id="applicationName"
              invalid={!!applicationNameInputValidation.error}
              invalidText={applicationNameInputValidation.error}
              labelText="Application name"
              name="applicationName"
              onBlur={applicationNameInputValidation.handleBlur}
              onChange={applicationNameInputValidation.handleChange}
              onInvalid={applicationNameInputValidation.handleInvalid}
              placeholder="my-app-name"
              pattern={lowercaseKebabCasePattern.source}
            />
            <ComboBox
              autoAlign
              id="teamName"
              invalid={!!teamInputValidation.error}
              invalidText={teamInputValidation.error}
              itemToString={(item) => item?.name || ''}
              items={getUserTeamsQuery.data?.data || []}
              name="teamName"
              onChange={handleChangeTeam}
              titleText="Assign a team to this application"
            />
            <input type="hidden" name="teamId" value={selectedTeamId} />{' '}
            {/* This hidden input allows us to submit the selected teamId since ComboBox doesn't do this natively */}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            label={submitLabels}
            onSubmitDone={handleSubmitDone}
            status={formState.status}
            variant={SubmitButtonVariant.Full}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
