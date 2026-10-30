// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ActionType, SubjectType, EnvironmentKey } from 'shared-types';
import { describe, expect, it } from 'vitest';

import dbLogToApiSchema from '../dbLogToApiSchema.js';

describe('dbLogToApiSchema', () => {
  it('converts a database log entry to the API schema', () => {
    const dbLog = {
      action: ActionType.Create,
      actorId: '1',
      applicationId: 'app-1',
      createdAt: new Date('2024-10-11'),
      environmentId: 'environmentId',
      id: '1',
      subjectId: 'subjectId',
      subjectKey: 'subjectKey',
      subjectType: SubjectType.FeatureFlag,
      oldData: null,
      newData: null,
      applicationName: 'application-name',
      environmentKey: EnvironmentKey.Development,
      actorEmail: 'actor@example.com',
    };

    expect(dbLogToApiSchema(dbLog)).toEqual({
      action: dbLog.action,
      actor: {
        id: dbLog.actorId,
        email: dbLog.actorEmail,
      },
      application: {
        id: dbLog.applicationId,
        name: dbLog.applicationName,
      },
      createdAt: dbLog.createdAt,
      environment: {
        id: dbLog.environmentId,
        key: dbLog.environmentKey,
      },
      id: dbLog.id,
      subject: {
        id: dbLog.subjectId,
        key: dbLog.subjectKey,
        type: dbLog.subjectType,
      },
      oldData: dbLog.oldData ?? null,
      newData: dbLog.newData ?? null,
    });
  });

  it('falls back to an empty email when actorEmail is null', () => {
    const dbLog = {
      action: ActionType.Create,
      actorId: '1',
      applicationId: 'app-1',
      createdAt: new Date('2024-10-11'),
      environmentId: 'environmentId',
      id: '1',
      subjectId: 'subjectId',
      subjectKey: 'subjectKey',
      subjectType: SubjectType.FeatureFlag,
      oldData: null,
      newData: null,
      applicationName: 'application-name',
      environmentKey: EnvironmentKey.Development,
      actorEmail: null,
    };

    expect(dbLogToApiSchema(dbLog).actor).toEqual({
      id: dbLog.actorId,
      email: '',
    });
  });
});
