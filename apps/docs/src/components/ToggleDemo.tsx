// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import AppPreview from './AppPreview';
import CodeEditor from './CodeEditor';
import Connector from './Connector';
import FlagPanel from './FlagPanel';
import type { FlagState } from './FlagPanel';

function ToggleDemo() {
  const [flags, setFlags] = useState<FlagState>({
    darkMode: false,
    greenButton: false,
    promoBanner: false,
    newLayout: false,
  });

  function toggle(key: keyof FlagState) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <section className="flex flex-col items-center container container-fluid mb-36 gap-6">
      <div className="flex items-center gap-6 w-full justify-center">
        <CodeEditor />
        <Connector symbol="+" className="bg-linear-135 from-cyan to-sky-500" />
        <FlagPanel flags={flags} toggle={toggle} />
        <Connector symbol="=" className="bg-linear-135 from-blue to-sky-400" />
        <AppPreview flags={flags} />
      </div>
      <div className="flex items-center justify-center px-8 h-11.25 rounded-full border border-blue-200 dark:border-dark-callout-border text-[14px] text-blue-800 dark:text-dark-callout-text bg-sky-blue dark:bg-dark-callout-bg">
        Toggle a flag and see how it changes what users see.
      </div>
    </section>
  );
}

export default ToggleDemo;
