// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import TestProviders from '../../../test/TestProviders';
import { RuleKeyInput } from '../RuleKeyInput';

describe('RuleKeyInput', () => {
  it('validates a required rule key', async () => {
    render(
      <TestProviders>
        <form>
          <RuleKeyInput defaultValue="rule-key" newRule ruleId="rule-1" />
        </form>
      </TestProviders>,
    );
    const input = screen.getByDisplayValue('rule-key');

    await userEvent.clear(input);
    await userEvent.tab();

    expect(screen.getByText('Rule key is required.')).toBeInTheDocument();
  });

  it('validates duplicate rule keys', async () => {
    render(
      <TestProviders>
        <form>
          <RuleKeyInput defaultValue="rule-key" newRule ruleId="rule-1" />
          <input name="key" defaultValue="rule-key-1" />
        </form>
      </TestProviders>,
    );
    const input = screen.getByDisplayValue('rule-key');

    fireEvent.change(input, { target: { value: 'rule-key-1' } });

    expect(screen.getByText('Rule keys must be unique.')).toBeInTheDocument();
  });

  it('does not show a validation error for a unique rule key', async () => {
    render(
      <TestProviders>
        <form>
          <RuleKeyInput defaultValue="rule-key" newRule ruleId="rule-1" />
        </form>
      </TestProviders>,
    );

    await userEvent.tab();

    expect(screen.queryByText('Rule key is required.')).not.toBeInTheDocument();
    expect(screen.queryByText('Rule keys must be unique.')).not.toBeInTheDocument();
  });

  it('does not throw when rendered outside a form', () => {
    render(
      <TestProviders>
        <RuleKeyInput defaultValue="rule-key" newRule ruleId="rule-1" />
      </TestProviders>,
    );

    const input = screen.getByDisplayValue('rule-key');

    fireEvent.blur(input);

    expect(screen.queryByText('Rule keys must be unique.')).not.toBeInTheDocument();
  });
});
