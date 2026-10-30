// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useActionState } from 'react';

import createSegment, { type CreateSegmentActionState } from '../../actions/createSegment';
import useInputValidation from '../../hooks/useInputValidation';
import {
  Button,
  ComposedModal,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
} from '../../components/Carbon';
import styles from './CreateSegmentModal.module.scss';
import useGetUserApplicationsQuery from '../../api/queries/useGetUserApplicationsQuery';
import { createSegmentSchema } from '../../schemas/createSegment';
import { ActionStatus } from '../../typings/common';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';
import { authClient } from '../../lib/auth-client';
import { lowercaseKebabCasePattern } from '../../constants/common';

interface CreateSegmentModalProps {
  defaultApplicationId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (applicationName: string, segmentKey: string) => void;
}

export function CreateSegmentModal({ open, onClose, defaultApplicationId = '', onSuccess }: CreateSegmentModalProps) {
  const session = authClient.useSession();
  const getUserApplicationsQuery = useGetUserApplicationsQuery(session.data?.user.id || '');
  const applications = getUserApplicationsQuery.data?.data || [];
  const initialState: CreateSegmentActionState = {
    form: {
      applicationId: defaultApplicationId || applications[0]?.id || '',
      description: '',
      key: '',
    },
    status: ActionStatus.Idle,
  };
  const [formState, formAction] = useActionState(createSegment, initialState);
  const noApplications = !applications.length;
  const keyInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.key,
    schema: createSegmentSchema.shape.key,
  });
  const descriptionInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.description,
    schema: createSegmentSchema.shape.description,
  });
  const applicationInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.applicationId,
    schema: createSegmentSchema.shape.applicationId,
  });

  function handleSubmitDone() {
    const application = applications.find((application) => application.id === formState.form.applicationId);
    const applicationName = application?.name || '';

    onSuccess(applicationName, formState.form.key);
  }

  return (
    <form action={formAction} name="createSegmentModal">
      <ComposedModal open={open} onClose={onClose} id="createSegmentModal">
        <ModalHeader title="Create Segment" className={styles.header}>
          <p className={styles.description}>
            A segment will be created for both development and production environments.
          </p>
        </ModalHeader>
        <ModalBody>
          <Stack gap={6}>
            {noApplications ? (
              <InlineNotification
                hideCloseButton
                kind="error"
                subtitle="There are no applications assigned to you."
                title="An application is required in order to create a segment"
              />
            ) : null}
            <TextInput
              defaultValue={formState.form.key}
              helperText="Format should follow a lowercase, kebab-case convention (ex. my-segment)"
              pattern={lowercaseKebabCasePattern.source}
              data-modal-primary-focus
              id="key"
              invalid={!!keyInputValidation.error}
              invalidText={keyInputValidation.error}
              labelText="Segment key"
              name="key"
              onBlur={keyInputValidation.handleBlur}
              onChange={keyInputValidation.handleChange}
              onInvalid={keyInputValidation.handleInvalid}
              placeholder="some-segment-key"
              required
            />
            <TextArea
              enableCounter
              id="description"
              invalid={!!descriptionInputValidation.error}
              invalidText={descriptionInputValidation.error}
              name="description"
              labelText="Description"
              placeholder=""
              defaultValue={formState.form.description}
              onBlur={descriptionInputValidation.handleBlur}
              onChange={descriptionInputValidation.handleChange}
              onInvalid={descriptionInputValidation.handleInvalid}
              required
              rows={2}
            />
            <Select
              defaultValue={formState.form.applicationId}
              id="applicationId"
              invalid={!!applicationInputValidation.error}
              invalidText={applicationInputValidation.error}
              labelText="Application"
              name="applicationId"
              onBlur={applicationInputValidation.handleBlur}
              onChange={applicationInputValidation.handleChange}
              onInvalid={applicationInputValidation.handleInvalid}
              required
            >
              {applications.map((application) => (
                <SelectItem value={application.id} text={application.name} key={application.id} />
              ))}
            </Select>
            {formState.status === ActionStatus.Error ? (
              <InlineNotification
                hideCloseButton
                kind="error"
                subtitle={formState.errors?.actionError?.subtitle || 'Please try again'}
                title="Failed to create segment"
              />
            ) : null}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            label="Create segment"
            disabled={noApplications}
            status={formState.status}
            variant={SubmitButtonVariant.Full}
            onSubmitDone={handleSubmitDone}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
