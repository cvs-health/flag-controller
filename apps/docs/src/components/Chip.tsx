// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import Icon, { IconName } from './Icon';

export enum ChipVariant {
  Success = 'success',
  Action = 'action',
}

interface ChipProps {
  label: string;
  variant?: ChipVariant;
}

function Chip({ label, variant = ChipVariant.Success }: ChipProps) {
  const variantRootClassNames = {
    [ChipVariant.Success]: 'bg-green-light dark:bg-green-900 text-green-dark dark:text-emerald-400',
    [ChipVariant.Action]: 'bg-magenta-light dark:bg-purple-900 text-magenta dark:text-purple-400',
  };
  const variantIconClassNames = {
    [ChipVariant.Success]: 'fill-green-dark dark:fill-emerald',
    [ChipVariant.Action]: 'fill-magenta dark:fill-purple-400',
  };
  const variantIcon = {
    [ChipVariant.Success]: IconName.Checkmark,
    [ChipVariant.Action]: IconName.Arrow,
  };

  return (
    <div
      className={`inline-flex items-center gap-2 text-[12px] font-semibold px-4 py-1.5 rounded-full mb-6 ${variantRootClassNames[variant]}`}
    >
      <Icon name={variantIcon[variant]} className={variantIconClassNames[variant]} />
      {label}
    </div>
  );
}

export default Chip;
