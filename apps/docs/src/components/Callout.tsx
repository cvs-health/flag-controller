// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren, ReactNode } from 'react';

interface CalloutProps extends PropsWithChildren {
  className?: string;
  description: string;
  label?: string;
  heading: ReactNode;
}

function Callout({ heading, description, label, className = '' }: CalloutProps) {
  return (
    <div className={`${className} text-center`}>
      {label && <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-secondary-text">{label}</p>}
      <div className="mb-7">{heading}</div>
      <p className="leading-7 mb-0 w-[70%] mx-auto">{description}</p>
    </div>
  );
}

export default Callout;
