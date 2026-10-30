// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';
import { organizationPluginOptions } from 'shared-constants';

// BETTER_AUTH_URL is server-only and absent on the client.
// This authClient supports server actions and browser components.
const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export const authClient = createAuthClient({
  baseURL: baseURL || 'http://localhost:8080',
  plugins: [organizationClient(organizationPluginOptions)],
});
