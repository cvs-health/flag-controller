// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { AuditEntry, LogsJoined } from 'shared-types';

// Repository rows carry a native Date createdAt that Fastify serializes to an ISO string at the controller.
type DbLog = Omit<LogsJoined, 'createdAt'> & { createdAt: Date };
type AuditEntryRow = Omit<AuditEntry, 'createdAt'> & { createdAt: Date };

function dbLogToApiSchema(dbLog: DbLog): AuditEntryRow {
  return {
    action: dbLog.action,
    actor: {
      id: dbLog.actorId,
      email: dbLog.actorEmail ?? '',
    },
    application: dbLog.applicationId
      ? {
          id: dbLog.applicationId,
          name: dbLog.applicationName,
        }
      : null,
    environment: dbLog.environmentId
      ? {
          id: dbLog.environmentId,
          key: dbLog.environmentKey,
        }
      : null,
    createdAt: dbLog.createdAt,
    id: dbLog.id,
    subject: {
      id: dbLog.subjectId,
      key: dbLog.subjectKey,
      type: dbLog.subjectType,
    },
    oldData: dbLog.oldData ?? null,
    newData: dbLog.newData ?? null,
  };
}

export default dbLogToApiSchema;
