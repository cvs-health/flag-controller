// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type { FlagState } from './FlagPanel';

const GRID_ROWS = [0, 1];
const GRID_COLS = [0, 1];
const LIST_ITEMS = [0, 1, 2];

export interface AppPreviewProps {
  flags: FlagState;
}

function AppPreview({ flags }: AppPreviewProps) {
  const dark = flags.darkMode;

  return (
    <div
      className={`box-border border rounded-2xl shadow-xl w-85 overflow-hidden flex flex-col shrink-0 self-stretch transition-all duration-300 ${
        dark ? 'bg-slate-950 border-slate-800' : 'bg-white border-white-off'
      }`}
    >
      {flags.promoBanner && <div className={`h-10 shrink-0 ${dark ? 'bg-slate-700' : 'bg-gray-300'}`} />}

      <div className="px-8 pt-8 pb-8 flex flex-col flex-1 min-h-0">
        <div
          className={`rounded-[10px] h-10 w-37.75 shrink-0 transition-colors duration-300 ${
            dark ? 'bg-slate-800' : 'bg-gray-100'
          }`}
        />

        <div
          className={`mt-3 h-4 w-51.5 shrink-0 rounded transition-colors duration-300 ${
            dark ? 'bg-slate-950' : 'bg-slate-200'
          }`}
        />

        {flags.newLayout ? (
          <div className="mt-8 flex flex-col gap-4">
            {GRID_ROWS.map((row) => (
              <div key={row} className="grid grid-cols-2 gap-4">
                {GRID_COLS.map((col) => (
                  <div key={col} className="flex flex-col">
                    <div
                      className={`rounded-[14px] size-[129.5px] transition-colors duration-300 ${
                        dark ? 'bg-slate-800' : 'bg-white-off'
                      }`}
                    />
                    <div
                      className={`mt-3 h-3 rounded w-full transition-colors duration-300 ${
                        dark ? 'bg-slate-800' : 'bg-white-off'
                      }`}
                    />
                    <div
                      className={`mt-3 h-3 rounded w-19.5 transition-colors duration-300 ${
                        dark ? 'bg-slate-950' : 'bg-gray-100'
                      }`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {LIST_ITEMS.map((i) => (
              <div
                key={i}
                className={`rounded-[10px] h-26 w-full pt-5 px-5 flex gap-4 transition-colors duration-300 ${
                  dark ? 'bg-slate-800-alpha' : 'bg-white-subtle'
                }`}
              >
                <div
                  className={`rounded-[10px] w-16 h-16 shrink-0 transition-colors duration-300 ${
                    dark ? 'bg-slate-700' : 'bg-white-off'
                  }`}
                />
                <div className="flex flex-col gap-2.5 justify-center">
                  <div
                    className={`h-3 rounded w-33 transition-colors duration-300 ${
                      dark ? 'bg-slate-700' : 'bg-white-off'
                    }`}
                  />
                  <div
                    className={`h-3 rounded w-27 transition-colors duration-300 ${
                      dark ? 'bg-slate-950' : 'bg-gray-100'
                    }`}
                  />
                  <div
                    className={`h-3 rounded w-19.5 transition-colors duration-300 ${
                      dark ? 'bg-slate-950' : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {flags.greenButton && (
          <div className="mt-6 h-[54px] flex items-center shrink-0">
            <div className="h-12 w-full rounded-[10px] bg-linear-to-r from-emerald-500 to-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export default AppPreview;
