// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export enum ListVariant {
  Bullet = 'bullet',
  Completed = 'completed',
  Action = 'action',
}

interface ListProps {
  variant?: ListVariant;
  items: string[];
}

function List({ items, variant = ListVariant.Bullet }: ListProps) {
  const variantClassNames = {
    [ListVariant.Bullet]: 'before:content-["•"]',
    [ListVariant.Completed]: 'before:content-["✓"] before:text-green dark:before:text-emerald',
    [ListVariant.Action]: 'before:content-["→"] before:text-magenta dark:before:text-purple-400',
  };
  return (
    <ul className="list-none p-0 m-0 space-y-3">
      {items.map((item) => (
        <li key={item} className={`relative pl-6 ${variantClassNames[variant]} before:absolute before:left-0`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default List;
