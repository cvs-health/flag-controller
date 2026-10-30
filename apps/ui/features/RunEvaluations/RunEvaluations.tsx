// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import CodeMirror from '@uiw/react-codemirror';
import classNames from 'classnames';
import {
  TimeZone,
  type FeatureFlagType,
  type FlagVariationsTableColumns,
  Meridiem,
  type RulesJoined,
} from 'shared-types';
import { json } from '@codemirror/lang-json';
import { type FocusEvent, type SyntheticEvent, useMemo, useState } from 'react';
import { parse, format } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

import Divider from '../../components/Divider/Divider';
import featureFlagRulesFormDataToRules from '../../utils/featureFlagRulesFormDataToRules';
import mapIdTo from '../../utils/mapIdTo';
import resolveFeatureFlag, { type ResolvingRule } from '../../utils/resolveFeatureFlag';
import styles from './RunEvaluations.module.scss';
import type { SegmentWithRules } from '../../typings/segments';
import validJSONString from '../../utils/validJSONString';
import { Button, DatePicker, DatePickerInput, InlineNotification, Stack } from '../../components/Carbon';
import { Section } from '../../components/Section/Section';
import { TimePicker } from '../../components/TimePicker/TimePicker';

interface RunEvaluationsProps {
  applicationId: string;
  defaultVariationKey: string;
  featureFlagRules?: RulesJoined[];
  featureFlagType: FeatureFlagType;
  segments: SegmentWithRules[];
  variations: FlagVariationsTableColumns[];
}

interface Time {
  date: string | undefined;
  time: string;
  meridiem: Meridiem;
  timezone: TimeZone;
}

export function RunEvaluations({
  applicationId,
  defaultVariationKey,
  featureFlagType,
  featureFlagRules = [],
  segments,
  variations,
}: RunEvaluationsProps) {
  const [time, setTime] = useState<Time>({
    date: undefined,
    time: '12:00',
    meridiem: Meridiem.PM,
    timezone: TimeZone.NewYork,
  });
  const initialContext = JSON.stringify({ user: { country: 'US' } }, null, 2);
  const [context, setContext] = useState(initialContext);
  const [[resolved, error], setResult] = useState<[string | null, string | null]>(['', '']);
  const errors = useMemo(() => {
    if (!validJSONString(context)) {
      return {
        context: 'Must be valid JSON.',
      };
    }

    return {};
  }, [context]);

  function handleChangeContext(value: string) {
    if (errors.context) {
      setContext(value);
    }
  }

  function handleReset() {
    setContext(initialContext);
  }

  function handleBlurContext(event: FocusEvent<HTMLDivElement>) {
    setContext(event.target.innerText);
  }

  function handleTest(event: SyntheticEvent<HTMLButtonElement>) {
    // Why not just use a formAction instead of a click handler?
    // Using a formAction would cause the form to submit and the parent component to re-render,
    // which would reset local state managed by useState hooks (such as the context JSON and the test result).
    // To preserve this state across test runs, we use a click handler instead.
    const form = event.currentTarget.closest('form');
    let rules: ResolvingRule[] = featureFlagRules;
    let currentDefaultVariationKey = defaultVariationKey;

    if (form) {
      const variationsByIdKey = mapIdTo(variations, 'key');
      const formData = new FormData(form);
      const parsedFormData = featureFlagRulesFormDataToRules(formData);
      const defaultVariationId = formData.get('defaultVariationId')?.toString() || '';

      currentDefaultVariationKey = variationsByIdKey.get(defaultVariationId) || defaultVariationKey;
      rules = parsedFormData.map((rule) => {
        return {
          ...rule,
          serveFractional: rule.serve?.value || null,
          serveVariationKey: variationsByIdKey.get(rule.serveVariationId || '') || null,
        };
      });
    }

    const time = deriveTime();
    const result = resolveFeatureFlag(
      rules,
      variations,
      currentDefaultVariationKey,
      JSON.parse(context),
      featureFlagType,
      segments,
      applicationId,
      time,
    );

    setResult(result);
  }

  function deriveTime() {
    if (time.date) {
      const date = parse(`${time.date} ${time.time} ${time.meridiem}`, 'MM/dd/yyyy h:mm aa', new Date());
      const timezone = time.timezone;
      const epochMs = fromZonedTime(date, timezone).getTime();

      return Math.floor(epochMs / 1000);
    }
  }

  function handleChangeDate([date]: Date[]) {
    setTime({ ...time, date: date ? format(date, 'MM/dd/yyyy') : '' });
  }

  function handleChangeTime(change: Partial<Time>) {
    setTime({ ...time, ...change });
  }

  return (
    <div className={styles.root}>
      <Stack gap={5}>
        <Section
          heading="Test run your feature flag"
          description="Test the flag against your own provided context. The rules you have set up in this tab will be applied, and the Test Result will be shown after clicking “Test”."
          className={styles.section}
        />
        <Divider />
        <div>
          <Stack gap={5}>
            <p className={styles.descriptor}>
              Optional: To test with a specific time condition, use the controls below.
            </p>
            <DatePicker datePickerType="single" locale="en" value={time.date} onChange={handleChangeDate}>
              <DatePickerInput
                // @ts-expect-error We need name and autoComplete, but the component does not have it defined as a prop
                autoComplete="off"
                id="date"
                labelText="Date (mm/dd/yyyy)"
                placeholder="mm/dd/yyyy"
                name="date"
              />
            </DatePicker>
            <TimePicker
              defaultMeridiem={Meridiem.PM}
              defaultTime="12:00"
              defaultTimeZone={TimeZone.NewYork}
              label="Time"
              name="test-rules"
              showUtcOffset={false}
              onChange={handleChangeTime}
            />
            <CodeMirror
              className={classNames(errors.context && styles.error)}
              data-testid="context-editor"
              defaultValue={initialContext}
              extensions={[json()]}
              height="200px"
              onChange={handleChangeContext}
              onBlur={handleBlurContext}
              value={context}
            />
            {errors.context ? (
              <p className={classNames('cds--form__helper-text', errors.context && styles.errorMessage)}>
                {errors.context}
              </p>
            ) : null}
          </Stack>
        </div>
        {error ? (
          <InlineNotification
            className={styles.notification}
            hideCloseButton
            kind="error"
            subtitle={error}
            title="Failed to evaluate flag"
          />
        ) : null}
        <Stack gap={5} orientation="horizontal" className={styles.actions}>
          <Button kind="ghost" size="lg" onClick={handleReset} className={styles.action}>
            Reset
          </Button>
          <Button kind="tertiary" size="lg" className={styles.action} disabled={!!errors.context} onClick={handleTest}>
            Test
          </Button>
        </Stack>
        {resolved ? (
          <Stack gap={4} className={styles.result}>
            <span className={styles.resultLabel}>Test Result</span>
            {time.date ? <div className={styles.simulatedTime}>Result calculated using simulated time</div> : null}
            <span className={styles.resultValue}>{resolved}</span>
          </Stack>
        ) : null}
      </Stack>
    </div>
  );
}
