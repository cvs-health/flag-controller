// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export interface AuthProvider {
  id: string;
  label?: string;
  kind: 'social' | 'oidc';
}

/** local: managed in Flag Controller. external: owned by the identity provider, so local writes are refused. */
export type IdentityMode = 'local' | 'external';

export interface IdentityModes {
  users: IdentityMode;
  /** Covers team memberships too: an IdP that owns teams also owns who is in them. */
  teams: IdentityMode;
  applications: IdentityMode;
}

export interface PublicConfig {
  authProviders: AuthProvider[];
  features: Record<string, unknown>;
  modes: IdentityModes;
}
