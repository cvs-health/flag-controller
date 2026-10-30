// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { Link } from '../Carbon';

interface ViewLinkProps {
  type: 'team' | 'application';
  value: string;
}

export function ViewLink({ type, value }: ViewLinkProps) {
  return <Link href={`/${type}s/${value}`}>View {type}</Link>;
}
