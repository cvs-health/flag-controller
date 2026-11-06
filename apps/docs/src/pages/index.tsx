// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';

import Callout from '../components/Callout';
import Card from '../components/Card';
import Chip, { ChipVariant } from '../components/Chip';
import GradientTypography from '../components/GradientTypography';
import Icon, { IconName } from '../components/Icon';
import LinkButton, { LinkButtonVariant } from '../components/LinkButton';
import List, { ListVariant } from '../components/List';
import ToggleDemo from '../components/ToggleDemo';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const features = [
    {
      icon: IconName.Users,
      gradientClassNames: 'from-blue-light to-blue',
      title: 'Rule-based targeting',
      description:
        'Target users by attribute, segment, or environment. Define who sees what without changing code or redeploying.',
    },
    {
      icon: IconName.Lightning,
      gradientClassNames: 'from-cyan to-cyan-dark',
      title: 'Kill switch',
      description: 'Something wrong in production? Disable any feature instantly with a single toggle.',
    },
    {
      icon: IconName.Chart,
      gradientClassNames: 'from-violet to-purple',
      title: 'Weighted rollouts',
      description: 'Release to 1% of users, then 10%, then everyone. Canary releases and progressive delivery.',
    },
    {
      icon: IconName.PR,
      gradientClassNames: 'from-emerald to-green',
      title: 'OpenFeature Provider support',
      description: (
        <>
          Native SDK support for Java, Python, Kotlin, iOS, Android, and more.{' '}
          <a href="https://openfeature.dev/ecosystem" target="_blank" rel="noopener noreferrer" className="underline">
            <GradientTypography>See all supported languages</GradientTypography>
          </a>
        </>
      ),
    },
    {
      icon: IconName.Shield,
      gradientClassNames: 'from-orange to-orange-dark',
      title: 'Audit logs',
      description:
        'Every flag change and every decision is logged and searchable. Know exactly what happened and when.',
    },
    {
      icon: IconName.Code,
      gradientClassNames: 'from-pink to-pink-dark',
      title: 'Authentication',
      description:
        'Powered by Better Auth, so you get secure, familiar auth flows with minimal setup, easier to adopt and maintain.',
    },
  ];
  const trustItems = [
    {
      icon: <Icon name={IconName.Server} className="stroke-current text-blue dark:text-blue-400" />,
      label: 'Self-hosted',
    },
    {
      icon: <Icon name={IconName.Secure} className="stroke-current text-blue dark:text-blue-400" />,
      label: 'Apache 2.0 licensed',
    },
    {
      icon: <Icon name={IconName.Experiment} className="stroke-current text-blue dark:text-blue-400" />,
      label: 'Open source standards (OpenFeature/flagd)',
    },
    {
      icon: <Icon name={IconName.Team} className="stroke-current text-blue dark:text-blue-400" />,
      label: 'Solo dev to full org',
    },
  ];

  return (
    <Layout
      title={siteConfig.title}
      description="Description will go into a meta tag in <head />"
      wrapperClassName="bg-linear-to-b from-white-subtle via-white-barely to-white-barely-used dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg homepage"
    >
      <div className="text-xl flex flex-col max-sm:py-9 py-30">
        <section className="flex flex-col items-center text-center container container-fluid">
          <Callout
            className="max-sm:mb-8 mb-18"
            heading={
              <h1>
                The <GradientTypography>open source</GradientTypography>
                <br />
                feature flag platform.
              </h1>
            }
            description="A free, self-hosted feature flagging platform built on OpenFeature standards. Ship features safely, on your infrastructure, on your terms."
          />
          <div className="flex gap-4">
            <LinkButton
              label="Read the docs"
              href="/docs/home"
              variant={LinkButtonVariant.Secondary}
              className="text-blue-link! hover:text-blue-link! dark:bg-dark-bg! dark:hover:bg-dark-bg! dark:border-blue-link!"
            />
            <LinkButton
              label="View on GitHub"
              href="https://github.com/cvs-health/flag-controller"
              icon={<Icon name={IconName.Github} />}
            />
          </div>
          <ThemedImage
            alt="Screenshot of Flags Table UI"
            className="w-full max-w-5xl h-auto mx-auto max-sm:mt-8 mt-16 mb-8 rounded-lg shadow-xl"
            sources={{
              light: useBaseUrl('/img/flags-table.png'),
              dark: useBaseUrl('/img/flags-table-dark.png'),
            }}
          />
        </section>
        <section className="bg-linear-to-t from-white dark:from-dark-bg to-transparent max-sm:mb-14 mb-36 py-13 grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 md:flex md:flex-wrap md:justify-center md:gap-8">
          {trustItems.map((item) => (
            <div key={item.label} className="flex w-full max-w-73 flex-col items-center gap-3 md:w-73">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-blue dark:bg-dark-card">
                {item.icon}
              </div>
              <span className="wrap-break-word text-sm font-semibold text-primary-emphasized-text text-center">
                {item.label}
              </span>
            </div>
          ))}
        </section>
        <section className="flex flex-col items-center text-center container container-fluid mb-14">
          <Callout
            label="NEW TO FEATURE FLAGS?"
            heading={
              <h3>
                Deploy first. Release when <GradientTypography>you're ready.</GradientTypography>
              </h3>
            }
            description="A feature flag is a conditional check around new functionality. Once it's in place, deploying code and releasing it to users become two separate steps. You can turn a feature on for 5% of users, expand to 50%, or shut it off entirely, all without touching your codebase or redeploying."
          />
        </section>
        <ToggleDemo />
        <section className="flex flex-col items-center container container-fluid max-sm:mb-14 mb-36">
          <Callout
            className="mb-7"
            heading={
              <h3>
                Everything you need to <GradientTypography>control</GradientTypography> your releases.
              </h3>
            }
            description="A simple but powerful toolkit for deciding exactly what ships, to whom, and when."
          />
          <div className="mt-12 flex flex-wrap max-sm:gap-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="max-sm:flex-1/3 flex-1/4 border-white-off dark:border-dark-card-border max-sm:p-4">
                <div
                  className={`max-sm:mb-4 mb-6 w-14 h-14 rounded-2xl flex items-center justify-center bg-linear-125 text-white dark:text-gray-950 ${feature.gradientClassNames}`}
                >
                  <Icon name={feature.icon} />
                </div>
                <h4 className="max-sm:text-base mb-3 font-semibold text-primary-emphasized-text font-[Outfit]">{feature.title}</h4>
                <p className="max-sm:text-sm text-[16px] max-sm:leading-5 leading-6.5 mb-0">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>
        <section className="flex flex-col items-center gap-10 container container-fluid max-sm:mb-14 mb-36">
          <Callout
            heading={
              <h3>
                Where we're <GradientTypography>headed</GradientTypography>
              </h3>
            }
            description="This is an open source project, which means it evolves with its community. Here's what's live today and what we’re exploring next."
          />
          <div className="flex max-sm:flex-col gap-10 items-stretch w-full">
            <Card className="border-green-light dark:border-green-900 border-2 flex-1">
              <Chip label="Available now" />
              <List
                className="max-sm:text-sm"
                variant={ListVariant.Completed}
                items={[
                  'Rule-based targeting',
                  'Kill switch',
                  'Weighted rollouts',
                  'Boolean / Number / Text / Object flags',
                  'Audit logs',
                  'Team-based organization',
                  'Flagsets',
                ]}
              />
            </Card>
            <Card className="border-magenta-light dark:border-purple-800 border-2 flex-1">
              <Chip label="What we're exploring" variant={ChipVariant.Action} />
              <List
                className="max-sm:text-sm"
                variant={ListVariant.Action}
                items={[
                  'Approval workflows',
                  'Usage reporting & metrics',
                  'Webhook integrations',
                  'AI-assisted flag generation',
                  'Experimentation & A/B hooks',
                ]}
              />
            </Card>
          </div>
        </section>
        <section className="container container-fluid">
          <div className="max-sm:px-6 max-sm:py-12 p-16 text-center bg-linear-160 from-cyan via-blue to-blue-dark rounded-3xl">

          <Callout
            heading={<h3 className="text-white">Ready to own your feature delivery?</h3>}
            description="Free, open source, and yours forever."
            className="mb-14 text-white"
          />
          <div className="flex justify-center gap-4">
            <LinkButton
              variant={LinkButtonVariant.Secondary}
              label="Read the docs"
              href="/docs/home"
              className="dark:bg-dark-bg! dark:hover:bg-dark-bg! dark:border-dark-card-border!"
            />
            <LinkButton
              label="View on GitHub"
              href="https://github.com/cvs-health/flag-controller"
              icon={<Icon name={IconName.Github} />}
              variant={LinkButtonVariant.Tertiary}
            />
          </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
