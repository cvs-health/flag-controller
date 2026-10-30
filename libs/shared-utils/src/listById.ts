// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

interface Item {
  id: string;
}

function listById<T extends Item>(list: T[]) {
  return list.reduce(
    (accumulator, item) => ({
      ...accumulator,
      [item.id]: item,
    }),
    {} as Record<string, T>,
  );
}

export default listById;
