// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export interface RequestUserDetails {
  email: string;
  id: string;
  name: string;
  organizationId: string | null;
}
