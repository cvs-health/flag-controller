// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function CodeEditor() {
  return (
    <div className="bg-code-bg border border-code-border rounded-2xl shadow-xl w-85 overflow-hidden text-left shrink-0">
      <div className="bg-code-tab-bg border-b border-code-border h-[37px] flex items-center px-3 pt-2.5 pb-[11px]">
        <span className="text-xs text-gray-500 font-mono">app.tsx</span>
      </div>
      <div className="pt-5 px-5">
        <div className="flex gap-3 items-start">
          <div className="w-[15.656px] shrink-0">
            {Array(10)
              .fill(0)
              .map((_, i) => i + 1)
              .map((n) => (
                <span
                  key={n}
                  className="block text-[13px] leading-[20.8px] font-mono h-[20.8px] text-gray-600 text-right whitespace-nowrap tabular-nums"
                >
                  {n}
                </span>
              ))}
          </div>
          <div className="flex flex-col min-w-0 flex-1 mb-4">
            <span className="block text-[13px] leading-[20.8px] font-mono h-[41.594px]">
              <span className="text-syntax-keyword">import</span>
              <span className="text-syntax-text"> </span>
              <span className="text-syntax-type">{'{ FeatureFlag }'}</span>
              <span className="text-syntax-text"> </span>
              <span className="text-syntax-keyword">from</span>
              <span className="text-syntax-string">'flagstream'</span>
              <span className="text-gray-600">;</span>
            </span>
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]" />
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]">
              <span className="text-syntax-keyword">const</span>
              <span className="text-syntax-text"> </span>
              <span className="text-syntax-variable">client</span>
              <span className="text-syntax-text"> = </span>
              <span className="text-syntax-function">FeatureFlag</span>
              <span className="text-syntax-text">.</span>
              <span className="text-syntax-function">init</span>
              <span className="text-syntax-text">();</span>
            </span>
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]" />
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]">
              <span className="text-syntax-keyword">function</span>
              <span className="text-syntax-text"> </span>
              <span className="text-syntax-function">App</span>
              <span className="text-syntax-text">{'() {'}</span>
            </span>
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]">
              <span className="text-syntax-keyword">{'  const'}</span>
              <span className="text-syntax-variable"> showBanner</span>
              <span className="text-syntax-text"> = </span>
              <span className="text-syntax-variable">client</span>
              <span className="text-syntax-text">.</span>
              <span className="text-syntax-function">get</span>
              <span className="text-syntax-text">(</span>
            </span>
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]">
              <span className="text-syntax-string">{"  'promo-banner'"}</span>
              <span className="text-syntax-text">);</span>
            </span>
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]" />
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px]">
              <span className="text-syntax-keyword">{'  return'}</span>
              <span className="text-syntax-text"> </span>
              <span className="text-gray-600">{'{'}</span>
              <span className="text-syntax-variable">showBanner</span>
              <span className="text-syntax-text"> && ...</span>
              <span className="text-gray-600">{'}'}</span>
            </span>
            <span className="block text-[13px] leading-[20.8px] font-mono h-[20.8px] text-syntax-text">{'}'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
