// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export const organizationPluginOptions = {
  schema: {
    team: {
      additionalFields: {
        deletedAt: {
          type: 'date',
          required: false,
          input: false,
        },
      },
    },
  },
  teams: { enabled: true },
} as const;
