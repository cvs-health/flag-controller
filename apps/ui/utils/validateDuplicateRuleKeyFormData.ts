// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

function validateDuplicateRuleKeyFormData(formData: FormData, value: string) {
  const ruleKeys = formData.getAll('key') as string[];

  return ruleKeys.filter((key) => key === value).length > 1;
}

export default validateDuplicateRuleKeyFormData;
