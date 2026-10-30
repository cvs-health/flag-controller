// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

/**
 * @file This file is for running migrations during development The migration script is imported and run so that it can be run as an npm script
 */
import { migrate } from './migrate.js';

migrate();
