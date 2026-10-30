// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import normalizeTeamName from '../normalizeTeamName.js';

describe('normalizeTeamName', () => {
  it('lowercases the name', () => {
    expect(normalizeTeamName('Default')).toBe('default');
  });

  it('replaces spaces with hyphens', () => {
    expect(normalizeTeamName('My Team')).toBe('my-team');
  });

  it('replaces consecutive non-alphanumeric characters with a single hyphen', () => {
    expect(normalizeTeamName('My   Team!!')).toBe('my-team');
  });

  it('trims leading and trailing hyphens', () => {
    expect(normalizeTeamName('  --My Team-- ')).toBe('my-team');
  });

  it('leaves an already kebab-case name unchanged', () => {
    expect(normalizeTeamName('my-team-name')).toBe('my-team-name');
  });

  it('replaces underscores with hyphens', () => {
    expect(normalizeTeamName('my_team_name')).toBe('my-team-name');
  });
});
