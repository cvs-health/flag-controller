// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function routeWhitelisted(route?: string) {
  const path = route?.split('?', 1)[0] ?? '';
  return (
    path === '/flagd' ||
    path === '/healthz' ||
    path === '/documentation' ||
    path.startsWith('/documentation/') ||
    path.startsWith('/api/auth/')
  );
}

export default routeWhitelisted;
