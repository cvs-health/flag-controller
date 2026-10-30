// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(dirname(__filename), '../../');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Used for the Carbon packages that point to ~ imports
    resolveAlias: {
      '~*': '*',
    },
    root: __dirname,
  },
  compiler: {
    removeConsole: false,
  },
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/flags',
        permanent: true,
      },
    ];
  },
  sassOptions: {
    // @carbon/react has many SASS files that have deprecation warnings so we silence these
    quietDeps: true,
  },
};

export default nextConfig;
