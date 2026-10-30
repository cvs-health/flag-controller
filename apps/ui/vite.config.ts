// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import react from '@vitejs/plugin-react';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      include: ['**/*.ts?(x)'],
      exclude: [
        '**/app/**',
        '*.config.*',
        '.next/**',
        'test/**',
        'tests/**',
        'typings/**',
        ...coverageConfigDefaults.exclude,
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: 'happy-dom',
    exclude: ['node_modules'],
    globals: true,
    include: ['**/*.test.ts?(x)'],
    pool: 'forks',
    setupFiles: ['./setupTests.ts'],
  },
});
