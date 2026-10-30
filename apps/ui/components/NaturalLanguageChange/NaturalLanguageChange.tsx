// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { ListItem, UnorderedList } from '@carbon/react';
import { ActionType, type FeatureFlagType, SubjectType } from 'shared-types';

import { actionLabels, featureFlagTypeLabels, subjectTypeLabels } from '../../constants/common';
import type { ChangeDataTypes } from '../../typings/audits';
import ruleConditionAsNaturalLanguage from '../../utils/ruleConditionAsNaturalLanguage';
import styles from './NaturalLanguageChange.module.scss';
import valueToString from '../../utils/valueToString';

interface NaturalLanguageChangeProps {
  actionType: ActionType;
  change: ChangeDataTypes[keyof ChangeDataTypes];
  subjectType: SubjectType;
}

export function NaturalLanguageChange({ subjectType, actionType, change }: NaturalLanguageChangeProps) {
  function adjectiveBasedOnAction() {
    switch (actionType) {
      case ActionType.Create:
        return 'New ';
      case ActionType.Delete:
        return 'Existing ';
      default:
        return '';
    }
  }

  function descriptionOfChange() {
    const subject = subjectTypeLabels[subjectType].toLowerCase();
    const preface = `${subjectTypeLabels[subjectType].toLowerCase()} ${actionLabels[actionType]}`.toLowerCase();

    switch (subjectType) {
      case SubjectType.FeatureFlag: {
        const featureFlagChange = change as ChangeDataTypes['flag'];

        return (
          <>
            <p>
              <span className={styles.bold}>{`${adjectiveBasedOnAction()} ${preface}`}</span>{' '}
              {`as a type of
              ${featureFlagTypeLabels[featureFlagChange.type as FeatureFlagType].toLowerCase()}`}
            </p>
            <p>{`The ${subject} has a description of: "${featureFlagChange.description}".`}</p>
          </>
        );
      }
      case SubjectType.FeatureFlagEnvironment: {
        const featureFlagChange = change as ChangeDataTypes['flagEnvironment'];

        return (
          <>
            <p>
              <span className={styles.bold}>{`${adjectiveBasedOnAction()} ${preface}`}</span>
            </p>
            <p>{`The ${subject} has a default variation of "${featureFlagChange.defaultServeKey}" and is ${featureFlagChange.enabled ? 'enabled' : 'disabled'}.`}</p>
          </>
        );
      }
      case SubjectType.Segment: {
        const segmentChange = change as ChangeDataTypes['segment'];

        return (
          <>
            <p>
              <span className={styles.bold}>{`${adjectiveBasedOnAction()} ${preface}`}</span>{' '}
            </p>
            <p>{`The ${subject} has a description of: "${segmentChange.description}".`}</p>
          </>
        );
      }
      case SubjectType.Rule: {
        const ruleChange = change as ChangeDataTypes['rule'];

        return (
          <>
            <p>
              <span className={styles.bold}>{`${adjectiveBasedOnAction()} ${preface}`}</span> with{' '}
              {`${ruleChange.conditions.length} conditions.`}
            </p>
            {ruleChange.serveVariationId ? (
              <p>{`The rule serves the variation "${ruleChange.serveVariationKey}"${ruleChange.conditions.length ? ' if: ' : '.'}`}</p>
            ) : null}
            {ruleChange.serveFractionalId ? (
              <p>{`The rule serves a weighted rollout${ruleChange.conditions.length ? ' if: ' : '.'}`}</p>
            ) : null}
            <UnorderedList>
              {ruleChange.conditions.map((condition) => (
                <ListItem key={`${Object.values(condition).join('-')}`}>
                  {ruleConditionAsNaturalLanguage(condition)}
                </ListItem>
              ))}
            </UnorderedList>
          </>
        );
      }
      case SubjectType.Variation: {
        const variationChange = change as ChangeDataTypes['variation'];

        return (
          <>
            <p>
              <span className={styles.bold}>{`${adjectiveBasedOnAction()} ${preface}`}</span>{' '}
              {`with key of
              ${variationChange.key}`}
            </p>
            <p>{`The ${subject} has a value of: "${valueToString(variationChange.value)}".`}</p>
          </>
        );
      }
      case SubjectType.Team: {
        const teamChange = change as ChangeDataTypes['team'];

        return (
          <p>
            <span className={styles.bold}>{`${adjectiveBasedOnAction()} ${preface}`}</span>{' '}
            {`with name of "${teamChange.name}".`}
          </p>
        );
      }
      default:
        return '';
    }
  }

  return <li className={styles.root}>{descriptionOfChange()}</li>;
}
