// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentKey } from 'shared-types';
import { startTransition, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import styles from './EnvironmentSwitcher.module.scss';
import type { SwitchEventHandlersParams } from '../../typings/carbon';
import updateSearchParams from '../../utils/updateSearchParams';
import { ContentSwitcher, Switch } from '../../components/Carbon';
import { environmentLabels } from '../../constants/common';

interface Environment {
  id: string;
  key: EnvironmentKey;
}

interface EnvironmentSwitcherProps<T extends Environment> {
  environments: T[];
  environmentId: string;
}

export function EnvironmentSwitcher<T extends Environment>({
  environments,
  environmentId,
}: EnvironmentSwitcherProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedEnvironmentIndex = useMemo(() => {
    return Object.keys(environmentLabels).findIndex((environment) => {
      const currentEnvironment = environments.find((env) => env.id === environmentId);

      return environment === currentEnvironment?.key;
    });
  }, [environments, environmentId]);

  function handleEnvironmentChange(event: SwitchEventHandlersParams) {
    const params = updateSearchParams(searchParams, [['rulesEnvironment', event.name as EnvironmentKey]]);

    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false });
    });
  }

  return (
    <ContentSwitcher
      className={styles.switcher}
      onChange={handleEnvironmentChange}
      selectedIndex={selectedEnvironmentIndex}
      selectionMode="manual"
      size="lg"
    >
      {Object.entries(environmentLabels).map(([key, label]) => (
        <Switch key={key} name={key} text={label} />
      ))}
    </ContentSwitcher>
  );
}
