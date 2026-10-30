// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

import remarkFeatureFlaggedHeadings from './plugins/remark-feature-flagged-headings';

const config: Config = {
  title: 'Flag Controller',
  tagline: 'Controlled innovation at your fingertips',
  favicon: 'img/favicon.svg',

  // Set the production url of your site here
  url: 'https://flagcontroller-docs.DOMAIN-HERE.com/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'GH-ORG-NAME', // Usually your GitHub org/user name.
  projectName: 'flag-controller', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/GH-ORG-NAME/flag-controller/tree/main/apps/docs',
          remarkPlugins: [remarkFeatureFlaggedHeadings],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        searchBarShortcut: true,
      }),
    ],
  ],
  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
      },
      items: [
        { type: 'search', position: 'right' },
        {
          className:
            'mr-4 !text-blue-link hover:!text-blue-link dark:!bg-dark-bg dark:hover:!bg-dark-bg dark:!border-blue-link',
          href: '/docs/home',
          label: 'Read the docs',
          page: '/',
          position: 'right',
          size: 'small',
          type: 'custom-linkButton',
          variant: 'secondary',
        },
        {
          className: 'mr-4',
          href: '/docs/getting-started',
          label: 'Get started',
          page: '/',
          position: 'right',
          size: 'small',
          type: 'custom-linkButton',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Meta Open Source Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
        href: 'https://opensource.fb.com',
        width: 183,
        height: 40,
      },
      copyright: `© ${new Date().getFullYear()} Flag Controller. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
