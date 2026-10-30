// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { headers } from 'next/headers';

async function getBetterAuthHeaders() {
  const headersList = await headers();

  return {
    origin: headersList.get('origin') || '',
    cookie: headersList.get('cookie') || '',
  };
}

export default getBetterAuthHeaders;
