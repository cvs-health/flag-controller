// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import 'i18next';
import { defaultNS, resources } from '../i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: true;
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
