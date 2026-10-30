// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@carbon/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { AuditEntry } from 'shared-types';

import { ChangeDetailsModal } from '../../components/ChangeDetailsModal/ChangeDetailsModal';

interface ChangeDetailsProps {
  auditEntry: AuditEntry;
}

export function ChangeDetails({ auditEntry }: ChangeDetailsProps) {
  const [changesVisible, setChangesVisible] = useState(false);
  const changesExist = auditEntry.oldData || auditEntry.newData;

  function handleVisbilityToggle() {
    setChangesVisible(!changesVisible);
  }

  return (
    <>
      <Button kind="ghost" size="sm" onClick={handleVisbilityToggle} disabled={!changesExist}>
        View change details
      </Button>
      {changesExist && changesVisible
        ? createPortal(
            <ChangeDetailsModal auditEntry={auditEntry} onClose={handleVisbilityToggle} open />,
            document.body,
          )
        : null}
    </>
  );
}
