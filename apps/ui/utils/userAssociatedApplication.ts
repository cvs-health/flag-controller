// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function userAssociatedApplication(applicationId = '', applications: Record<'id', string>[] = []) {
  return applications.some((app) => app.id === applicationId);
}

export default userAssociatedApplication;
