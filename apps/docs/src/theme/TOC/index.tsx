// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import TOC from '@theme-original/TOC';
import type TOCType from '@theme/TOC';
import type { WrapperProps } from '@docusaurus/types';
import { OpenFeature, useWhenProviderReady } from '@openfeature/react-sdk';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useLocalPathname } from '@docusaurus/theme-common/internal';

type Props = WrapperProps<typeof TOCType>;

function TOCWrapper(props: Props) {
  useWhenProviderReady();
  const doc = useDoc();
  // @ts-expect-error featureFlaggedHeadings exists from the plugin
  const featureFlaggedHeadings = doc.frontMatter.featureFlaggedHeadings || {};
  const filteredItems = filterItemsBasedOnFeatureFlags(props.toc || []);

  function filterItemsBasedOnFeatureFlags(items: typeof props.toc) {
    const filtered = items.filter((item) => {
      const featureFlag = featureFlaggedHeadings[item.id];

      if (!featureFlag) return true;

      return OpenFeature.getClient().getBooleanValue(featureFlag, false);
    });

    return filtered;
  }

  return <TOC {...props} toc={filteredItems} />;
}

function ConditionalTOC(props: Props) {
  const localPathname = useLocalPathname();
  // Only show the TOC on docs pages
  if (localPathname.startsWith('/docs/')) {
    return <TOCWrapper {...props} />;
  }

  return <TOC {...props} />;
}

export default ConditionalTOC;
