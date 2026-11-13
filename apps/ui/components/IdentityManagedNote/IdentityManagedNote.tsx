// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Locked } from '@carbon/icons-react';

import styles from './IdentityManagedNote.module.scss';

/** Stands in for create, edit and delete controls the identity provider owns. */
export function IdentityManagedNote() {
  return (
    <p className={styles.root}>
      <Locked aria-hidden="true" />
      Managed by your identity provider
    </p>
  );
}
