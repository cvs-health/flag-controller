// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { OpenFeatureProvider } from '@openfeature/react-sdk';
import type { PropsWithChildren } from 'react';

function Providers({ children }: PropsWithChildren) {
  return <OpenFeatureProvider>{children}</OpenFeatureProvider>;
}

export default Providers;
