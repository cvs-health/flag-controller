// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { User } from 'shared-types';

import apiRequest from '../../utils/apiRequest';

export const getUsersUrl = 'users';

async function getUsers() {
  return await apiRequest<User[]>(getUsersUrl);
}

export default getUsers;
