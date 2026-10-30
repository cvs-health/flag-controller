// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export interface ConnectorProps {
  className?: string;
  symbol: string;
}

function Connector({ symbol, className = '' }: ConnectorProps) {
  return (
    <div
      className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white dark:text-gray-950 text-2xl font-bold shadow-lg ${className}`}
    >
      {symbol}
    </div>
  );
}

export default Connector;
