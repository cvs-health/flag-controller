// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@carbon/react';
import { type AuditEntry, SubjectType } from 'shared-types';

import { ActionTag } from '../components/ActionTag/ActionTag';
import { subjectTypeLabels } from '../constants/common';
import { ChangeDetails } from '../features/ChangeDetails/ChangeDetails';
import formatDateTime from './formatDateTime';

function parseAuditLogResponse(response: AuditEntry[] = []) {
  return response.map((entry) => {
    return {
      action: <ActionTag action={entry.action} />,
      actorEmail: entry.actor.email,
      applicationName: entry.application ? (
        <Link href={`/applications/${entry.application.name}`}>{entry.application.name}</Link>
      ) : (
        '—'
      ),
      createdAt: formatDateTime(entry.createdAt),
      details: <ChangeDetails auditEntry={entry} />,
      environmentKey: <span style={{ textTransform: 'capitalize' }}>{entry.environment?.key || '—'}</span>,
      id: entry.id.toString(),
      key: subjectKeyLink(entry.subject.key, entry.subject.type, entry.application?.name),
      subject: subjectTypeLabels[entry.subject.type],
    };
  });
}

/**
 * Provides a link to the subject key based on its type.
 */
function subjectKeyLink(key: string, type: SubjectType, applicationName?: string | null) {
  switch (type) {
    case SubjectType.FeatureFlag:
    case SubjectType.FeatureFlagEnvironment:
      return <Link href={`/applications/${applicationName}/flags/${key}`}>{key}</Link>;
    case SubjectType.Segment:
      return <Link href={`/applications/${applicationName}/segments/${key}`}>{key}</Link>;
    case SubjectType.Team:
      return <Link href={`/teams/${key}`}>{key}</Link>;
    default:
      return key;
  }
}

export default parseAuditLogResponse;
