// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Scope } from 'shared-types';

import { Stack } from '../../components/Carbon';
import { LogTable } from '../../features/LogTable/LogTable';
import { Switcher } from '../../components/Switcher/Switcher';
import styles from './page.module.scss';

interface LogsProps {
  searchParams: Promise<Record<'scope', string | undefined>>;
}

const logsSwitches = {
  [Scope.Me]: 'Logs from your applications',
  [Scope.All]: 'Logs across all applications',
} as const;

async function Logs({ searchParams }: LogsProps) {
  const searchParameters = await searchParams;
  const scope = (searchParameters.scope === Scope.All ? Scope.All : Scope.Me) as Scope;

  return (
    <Stack className={styles.root} gap={7}>
      <h1>Logs</h1>
      <Switcher className={styles.switcher} parameter="scope" selected={scope} switches={logsSwitches} />
      <LogTable />
    </Stack>
  );
}

export default Logs;
