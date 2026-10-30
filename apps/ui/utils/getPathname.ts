// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';
import { headers } from 'next/headers';

/**
 * Quick way to get the pathname server-side
 */
async function getPathname() {
  const headersList = await headers();

  return headersList.get('x-next-url-pathname');
}

export default getPathname;
