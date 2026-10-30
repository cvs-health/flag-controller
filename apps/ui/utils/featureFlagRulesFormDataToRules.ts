// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { parseFeatureFlagRule } from './parseFeatureFlagRule';

export type { ParsedFeatureFlagRule } from './parseFeatureFlagRule';

/**
 * Use the rule keys as a base list to parse each of the form's rules
 */
function featureFlagRulesFormDataToRules(formData: FormData) {
  const ruleKeys = formData.getAll('key') as string[];

  return ruleKeys.map((key, index) => parseFeatureFlagRule(formData, key, index));
}

export default featureFlagRulesFormDataToRules;
