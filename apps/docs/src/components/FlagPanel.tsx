// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export type FlagState = {
  darkMode: boolean;
  greenButton: boolean;
  promoBanner: boolean;
  newLayout: boolean;
};

const FLAG_LIST: { key: keyof FlagState; name: string }[] = [
  { key: 'darkMode', name: 'Dark Mode' },
  { key: 'greenButton', name: 'Green button' },
  { key: 'promoBanner', name: 'Promo Banner' },
  { key: 'newLayout', name: 'New Layout' },
];

export interface FlagPanelProps {
  flags: FlagState;
  toggle: (key: keyof FlagState) => void;
}

function FlagPanel({ flags, toggle }: FlagPanelProps) {
  return (
    <div className="bg-white dark:bg-dark-card border-[0.5px] border-gray-200 dark:border-dark-card-border rounded-2xl shadow-xl w-70 h-[390px] px-[32.5px] pt-[32.5px] pb-px flex flex-col gap-8 shrink-0">
      <div className="flex flex-col gap-6">
        {FLAG_LIST.map((flag, i) => (
          <div key={flag.key}>
            <div className="flex h-6 items-center justify-between">
              <span className="text-[16px] font-medium text-gray-950 dark:text-white">{flag.name}</span>
              <button
                type="button"
                onClick={() => toggle(flag.key)}
                className={`w-8 h-[18.4px] rounded-full relative cursor-pointer transition-colors duration-200 outline-none focus:outline-none border-0 ${
                  flags[flag.key] ? 'bg-toggle-active' : 'bg-toggle-inactive'
                }`}
                aria-pressed={flags[flag.key]}
                aria-label={`Toggle ${flag.name}`}
              >
                <div
                  className={`absolute top-px w-4 h-4 bg-white dark:bg-gray-950 rounded-full shadow transition-all duration-200 ${
                    flags[flag.key] ? 'right-px' : 'left-px'
                  }`}
                />
              </button>
            </div>
            {i < FLAG_LIST.length - 1 && <div className="mt-6 border-t border-gray-100 dark:border-dark-card-border" />}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-dark-card-border pt-[30px] flex justify-center">
        <div className="flex items-center gap-3">
          <div className="size-1.5 rounded-full bg-cyan shrink-0" />
          <span className="text-[14px] font-semibold tracking-[0.7px] text-cyan font-[Outfit]">FLAG CONTROLLER</span>
        </div>
      </div>
    </div>
  );
}

export default FlagPanel;
