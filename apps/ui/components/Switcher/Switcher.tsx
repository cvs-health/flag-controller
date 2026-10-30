// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import type { SwitchEventHandlersParams } from '../../typings/carbon';
import { ContentSwitcher, Switch } from '../Carbon';
import updateSearchParams from '../../utils/updateSearchParams';

interface SwitcherProps {
  className?: string;
  parameter: string;
  selected: string;
  switches: Record<string, string>;
}

export function Switcher({ className, parameter, selected, switches }: SwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [_isTransitionPending, startTransition] = useTransition();

  const selectedIndex = Object.keys(switches).indexOf(selected);

  function handleTabChange(event: SwitchEventHandlersParams) {
    const params = updateSearchParams(searchParams, [[parameter, event.name as string]]);

    startTransition(() => {
      router.push(`${pathname}?${params}`, { scroll: false });
    });
  }

  return (
    <ContentSwitcher
      className={className}
      onChange={handleTabChange}
      selectedIndex={selectedIndex}
      selectionMode="manual"
      size="lg"
    >
      {Object.entries(switches).map(([key, text]) => (
        <Switch name={key} text={text as string} key={key} />
      ))}
    </ContentSwitcher>
  );
}
