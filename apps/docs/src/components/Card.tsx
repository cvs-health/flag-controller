// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-dark-card border border-solid rounded-2xl p-8 ${className}`}>{children}</div>
  );
}

export default Card;
