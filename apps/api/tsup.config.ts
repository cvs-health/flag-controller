// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts', './src/otel.setup.ts'],
  format: ['esm'],
  clean: true,
});
