// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { startTransition, type SubmitEvent } from 'react';

function submitFormAction(event: SubmitEvent<HTMLFormElement>, formAction: (payload: FormData) => void) {
  event.preventDefault();

  startTransition(() => {
    formAction(new FormData(event.currentTarget));
  });
}

export default submitFormAction;
