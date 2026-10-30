// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@carbon/react';
import { ActionType, SubjectType, EnvironmentKey } from 'shared-types';
import { describe, expect, it } from 'vitest';

import parseAuditLogResponse from '../parseAuditLogResponse';

describe('parseAuditLogResponse', () => {
  it('should parse the response', () => {
    const auditEntry = {
      action: ActionType.Create,
      actor: {
        email: 'email@mail.com',
        id: '1',
      },
      application: {
        name: 'application-name',
        id: 'application-id',
      },
      createdAt: '2024-01-01 12:00:00',
      environment: {
        id: 'environment-id',
        key: EnvironmentKey.Development,
      },
      id: 'id',
      subject: {
        id: 'subjectId',
        key: 'subjectKey',
        type: SubjectType.FeatureFlag,
      },
      newData: {},
      oldData: {},
    };
    const [result] = parseAuditLogResponse([auditEntry]);

    expect(result?.action).toBeDefined();
    expect(result?.actorEmail).toEqual(auditEntry.actor.email);
    expect(result?.applicationName).toEqual(
      <Link href={`/applications/${auditEntry.application.name}`}>{auditEntry.application.name}</Link>,
    );
    expect(result?.createdAt).toEqual('01/01/2024 at 12:00 PM');
    expect(result?.environmentKey).toEqual(
      <span style={{ textTransform: 'capitalize' }}>{auditEntry.environment.key}</span>,
    );
    expect(result?.id).toEqual(auditEntry.id.toString());
    expect(result?.key).toEqual(
      <Link href={`/applications/${auditEntry.application.name}/flags/${auditEntry.subject.key}`}>
        {auditEntry.subject.key}
      </Link>,
    );
    expect(result?.subject).toEqual('Feature Flag');
  });
});
