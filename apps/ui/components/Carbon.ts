// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import dynamic from 'next/dynamic';

export * from '@carbon/react';
export const MenuButton = dynamic(() => import('@carbon/react').then((result) => result.MenuButton), { ssr: false });
