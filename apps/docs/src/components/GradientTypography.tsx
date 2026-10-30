// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { PropsWithChildren } from 'react';

function GradientTypography({ children }: PropsWithChildren) {
  return <span className="gradient-text">{children}</span>;
}

export default GradientTypography;
