// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { useActionState, useState } from 'react';
import type { User } from 'shared-types';
import {
  Button,
  ComposedModal,
  FilterableMultiSelect,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@carbon/react';

import addTeamMembers, { type AddTeamMembersActionState } from '../../actions/addTeamMembers';
import styles from './AddMembersModal.module.scss';
import useGetUsersQuery from '../../api/queries/useGetUsersQuery';
import { ActionStatus } from '../../typings/common';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';

const initialActionState: AddTeamMembersActionState = {
  form: { memberIds: [], teamId: '' },
  status: ActionStatus.Idle,
};

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teamId: string;
}

export function AddMembersModal({ open, onClose, teamId, onSuccess }: AddMembersModalProps) {
  const getUsersQuery = useGetUsersQuery();
  const users = getUsersQuery.data ?? [];
  const [formState, formAction] = useActionState(addTeamMembers, initialActionState);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const memberError = formState.errors?.fieldErrors?.memberIds?.[0];
  // A member-specific problem belongs on the field, so the banner only covers the rest.
  const actionError = memberError ? undefined : formState.errors?.actionError;

  function handleSelectionChange({ selectedItems }: { selectedItems: User[] }) {
    setSelectedMembers(selectedItems);
  }

  return (
    <form name="addMembersModal" action={formAction}>
      <ComposedModal
        aria-label="Add members modal"
        id="addMembersModal"
        onClose={onClose}
        open={open}
        preventCloseOnClickOutside
        size="md"
      >
        <ModalHeader title="Add members" className={styles.header} />
        <ModalBody>
          {!users.length && getUsersQuery.isSuccess && (
            <InlineNotification
              hideCloseButton
              kind="error"
              title="There are no users available."
              subtitle=""
              className={styles.notification}
            />
          )}
          {getUsersQuery.isError && (
            <InlineNotification
              kind="error"
              title="System error"
              subtitle="Failed to load users. Please try again later."
              className={styles.notification}
            />
          )}
          {actionError && (
            <InlineNotification
              kind="error"
              title={actionError.title}
              subtitle={actionError.subtitle}
              className={styles.notification}
            />
          )}
          <div className={styles.members}>
            <FilterableMultiSelect
              autoAlign
              id="members-select"
              titleText="Select members from the list"
              placeholder="Filter..."
              items={users}
              itemToString={(item: User | null) => item?.name ?? ''}
              itemToElement={(item: User) => (
                <div className={styles.memberItem}>
                  <div className={styles.memberName}>{item.name}</div>
                  <div className={styles.memberEmail}>{item.email}</div>
                </div>
              )}
              onChange={handleSelectionChange}
              selectionFeedback="top-after-reopen"
              initialSelectedItems={[]}
              invalid={!!memberError}
              invalidText={memberError}
              disabled={getUsersQuery.isPending}
            />
          </div>
          <input type="hidden" name="memberIds" value={JSON.stringify(selectedMembers.map((m) => m.id))} />
          <input type="hidden" name="teamId" value={teamId} />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            disabled={!users.length}
            label="Add members"
            onSubmitDone={onSuccess}
            status={formState.status}
            variant={SubmitButtonVariant.Full}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
