// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use server';

import { revalidatePath } from 'next/cache';

async function revalidatePage() {
  revalidatePath('/', 'page');
}

export default revalidatePage;
