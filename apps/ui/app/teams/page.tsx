// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '../../components/Carbon';
import { TeamsTable } from '../../features/TeamsTable/TeamsTable';
import styles from './page.module.scss';

function Teams() {
  return (
    <Stack className={styles.root} gap={8}>
      <h1>Teams</h1>
      <TeamsTable />
    </Stack>
  );
}

export default Teams;
