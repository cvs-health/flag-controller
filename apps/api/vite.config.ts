// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/// <reference types="vitest" />
import { resolve } from 'node:path';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/__generated__',
        'codegen.ts',
        'drizzle.config.ts',
        'otel.setup.ts',
        'src/app.ts',
        'src/db/**',
        'src/index.ts',
        'src/migrate.ts',
        'src/plugins/gql.ts',
        'src/runMigrate.ts',
        'src/schemas/**',
        'src/test/**',
      ],
      provider: 'v8',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    globals: true,
    setupFiles: resolve(__dirname, 'src/test/setup.ts'),
    mockReset: true,
    pool: 'forks',
  },
});
