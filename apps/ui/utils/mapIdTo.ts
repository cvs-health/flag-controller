// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

interface ListItem {
  id: string;
}

function mapIdTo<T extends ListItem>(list: T[]): Map<string, T>;
function mapIdTo<T extends ListItem, K extends keyof T>(list: T[], key: K): Map<string, T[K]>;
function mapIdTo<T extends ListItem, K extends keyof T>(list: T[], key?: K) {
  return new Map(list.map((item) => [item.id, key ? item[key] : item]));
}

export default mapIdTo;
