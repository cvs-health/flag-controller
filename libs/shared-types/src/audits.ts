// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { EnvironmentKey } from './environments.js';

export enum ActionType {
  Archive = 'archive',
  Create = 'create',
  Delete = 'delete',
  Disable = 'disable',
  Edit = 'edit',
  Enable = 'enable',
  Restore = 'restore',
}

export enum SubjectType {
  Application = 'application',
  Context = 'context',
  FeatureFlag = 'feature-flag',
  FeatureFlagEnvironment = 'feature-flag-environment',
  Rule = 'rule',
  Segment = 'segment',
  Team = 'team',
  Variation = 'variation',
}

export interface Subject {
  id: string;
  key: string;
  type: SubjectType;
}

export interface Actor {
  id: string;
  email: string;
}

interface Application {
  id: string;
  name: string | null;
}

interface Environment {
  id: string;
  key: EnvironmentKey | null;
}

export interface AuditEntry {
  action: ActionType;
  actor: Actor;
  application: Application | null;
  environment: Environment | null;
  createdAt: string;
  id: string;
  newData: Record<string, unknown> | null;
  oldData: Record<string, unknown> | null;
  subject: Subject;
}

export interface LogsTableColumns {
  action: ActionType;
  actorId: string;
  applicationId: string | null;
  createdAt: string;
  environmentId: string | null;
  id: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  subjectId: string;
  subjectKey: string;
  subjectType: SubjectType;
}

export interface LogsJoined extends LogsTableColumns {
  applicationName: string | null;
  environmentKey: EnvironmentKey | null;
  actorEmail: string | null;
}
