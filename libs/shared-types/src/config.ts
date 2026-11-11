// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export interface AuthProvider {
  id: string;
  label?: string;
  kind: 'social';
}

export interface PublicConfig {
  authProviders: AuthProvider[];
  features: Record<string, unknown>;
  modes: Record<string, unknown>;
}
