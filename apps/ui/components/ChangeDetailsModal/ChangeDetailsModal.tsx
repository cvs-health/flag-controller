// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import classNames from 'classnames';
import { ActionType, type AuditEntry } from 'shared-types';

import { Add, Close, DirectionStraightRight } from '@carbon/icons-react';
import { DiffType } from '../../typings/audits';
import compareAuditEntryData from '../../utils/compareAuditEntryData';
import formatDateTime from '../../utils/formatDateTime';
import { DiffItem } from '../DiffItem/DiffItem';
import { NaturalLanguageChange } from '../NaturalLanguageChange/NaturalLanguageChange';
import styles from './ChangeDetailsModal.module.scss';

interface ChangeDetailsModalProps {
  auditEntry: AuditEntry;
  onClose: () => void;
  open: boolean;
}

export function ChangeDetailsModal({ auditEntry, open, onClose }: ChangeDetailsModalProps) {
  const diff = compareAuditEntryData(auditEntry.subject.type, auditEntry.oldData, auditEntry.newData);
  const addedVisible = diff.add.length || auditEntry.action === ActionType.Create;
  const removedVisible = diff.remove.length || auditEntry.action === ActionType.Delete;

  return (
    <ComposedModal open={open} onClose={onClose} aria-label="Change details modal">
      <ModalHeader title="Change details" />
      <ModalBody>
        <ul className={styles.list}>
          <li>
            <span className={styles.label}>Application:</span>
            <span>{auditEntry.application?.name || '—'}</span>
          </li>
          <li>
            <span className={styles.label}>Environment:</span>
            <span className={styles.environment}>{auditEntry.environment?.key || '—'}</span>
          </li>
          <li>
            <span className={styles.label}>Key:</span>
            <span>{auditEntry.subject.key}</span>
          </li>
          <li>
            <span className={styles.label}>Actor:</span>
            <span>{auditEntry.actor.email}</span>
          </li>
          <li>
            <span className={styles.label}>Date:</span>
            <span>{formatDateTime(auditEntry.createdAt)}</span>
          </li>
        </ul>
        <ul className={styles.changes}>
          {diff.change.length ? (
            <li className={classNames(styles.changeHeader, styles.changed)}>
              <DirectionStraightRight className={styles.changeIcon} /> Changed
            </li>
          ) : null}
          {diff.change.map((item) => (
            <DiffItem
              key={`${item.newValue}${item.oldValue}`}
              newValue={item.newValue}
              oldValue={item.oldValue}
              property={item.property}
              type={DiffType.Change}
            />
          ))}
          {removedVisible ? (
            <li className={classNames(styles.changeHeader, styles.removed)}>
              <Close className={styles.changeIcon} /> Removed
            </li>
          ) : null}
          {auditEntry.action === ActionType.Delete && auditEntry.oldData ? (
            <NaturalLanguageChange
              actionType={auditEntry.action}
              change={auditEntry.oldData}
              subjectType={auditEntry.subject.type}
            />
          ) : null}
          {diff.remove.map((item) => (
            <DiffItem
              key={`${item.newValue}${item.oldValue}`}
              newValue={item.newValue}
              oldValue={item.oldValue}
              property={item.property}
              type={DiffType.Remove}
            />
          ))}
          {addedVisible ? (
            <li className={classNames(styles.changeHeader, styles.added)}>
              <Add className={styles.changeIcon} /> Added
            </li>
          ) : null}
          {auditEntry.action === ActionType.Create && auditEntry.newData ? (
            <NaturalLanguageChange
              actionType={auditEntry.action}
              change={auditEntry.newData}
              subjectType={auditEntry.subject.type}
            />
          ) : null}
          {diff.add.map((item) => (
            <DiffItem
              key={`${item.newValue}${item.oldValue}`}
              newValue={item.newValue}
              oldValue={item.oldValue}
              property={item.property}
              type={DiffType.Add}
            />
          ))}
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </ComposedModal>
  );
}
