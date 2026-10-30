// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { TextInput } from '../Carbon';
import { z } from 'zod';
import { lowercaseKebabCasePattern } from '../../constants/common';
import validateDuplicateRuleKeyFormData from '../../utils/validateDuplicateRuleKeyFormData';
import useInputValidation from '../../hooks/useInputValidation';

interface RuleKeyProps {
  defaultValue: string;
  newRule: boolean;
  ruleId: string;
}

export function RuleKeyInput({ newRule, defaultValue, ruleId }: RuleKeyProps) {
  function duplicateKeyCheck(currentTarget: EventTarget & HTMLInputElement, formData: FormData) {
    const duplicateKey = validateDuplicateRuleKeyFormData(formData, currentTarget.value);

    return duplicateKey ? 'Rule keys must be unique.' : undefined;
  }
  const inputValidation = useInputValidation({
    schema: z.string().min(1, 'Rule key is required.'),
    onChange: duplicateKeyCheck,
    onBlur: duplicateKeyCheck,
  });

  return newRule ? (
    <TextInput
      autoFocus
      defaultValue={defaultValue}
      helperText="Rule keys must be unique. Format should follow a lowercase, kebab-case convention (ex. my-feature-flag-rule)"
      id={`${ruleId}-key`}
      invalid={!!inputValidation.error}
      invalidText={inputValidation.error}
      labelText="Rule key"
      name="key"
      onBlur={inputValidation.handleBlur}
      onChange={inputValidation.handleChange}
      onInvalid={inputValidation.handleInvalid}
      pattern={lowercaseKebabCasePattern.source}
      required
      type="text"
    />
  ) : (
    <input type="hidden" name="key" value={defaultValue} readOnly />
  );
}
