// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '../../components/Carbon';
import { ApplicationsTable } from '../../features/ApplicationsTable/ApplicationsTable';
import styles from './page.module.scss';

function Applications() {
  return (
    <Stack className={styles.root} gap={8}>
      <h1>Applications</h1>
      <ApplicationsTable />
    </Stack>
  );
}

export default Applications;
