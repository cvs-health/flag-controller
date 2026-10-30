// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

const { FeatureFlag } = require('../types/featureFlags');

/**
 * Remark plugin to extract feature flags from FeatureFlagged components
 * and associate them with headings
 */
function remarkFeatureFlaggedHeadings() {
  return async (tree, file) => {
    const { visit } = await import('unist-util-visit');
    const headingFlags = {};

    visit(tree, (node) => {
      if (node.name === 'FeatureFlagged') {
        const flagKeyProp = node.attributes.find((attribute) => attribute.name === 'flagKey');

        if (flagKeyProp) {
          const currentFlag = flagKeyProp.value.value.split('.').pop();

          node.children.forEach((childNode) => {
            if (childNode.type === 'heading') {
              const headingId = childNode.data?.hProperties?.id || childNode.data?.id;

              headingFlags[headingId] = FeatureFlag[currentFlag];
            }
          });
        }
      }
    });

    if (!file.data.frontMatter) {
      file.data.frontMatter = {};
    }

    file.data.frontMatter.featureFlaggedHeadings = headingFlags;
  };
}

module.exports = remarkFeatureFlaggedHeadings;
