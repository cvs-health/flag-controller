// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import type z from 'zod';

import type { authClient } from '../lib/auth-client';

export enum ActionStatus {
  Error = 'error',
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
}

export interface ActionState<S = unknown> {
  errors?: ActionErrors<S>;
  form: S;
  status: ActionStatus;
}

export interface ActionErrorPresentation {
  subtitle: string;
  title: string;
}

export type ActionErrors<S = unknown, V = z.core.$ZodFlattenedError<S>> = Partial<V> & {
  actionError?: ActionErrorPresentation;
};

// There's not a clean export from the better-auth library we can use
export interface BetterAuthFetchError {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
}

export type AuthSession = typeof authClient.$Infer.Session | null;

export interface FiltersFormDataState<F, P> {
  errorMessage: string;
  filterCount: number;
  form: F;
  parsed: Partial<P>;
  previousForm: F;
  status: ActionStatus;
}

export enum FormAction {
  ResetStatus = 'resetStatus',
  ResetForm = 'resetForm',
  RestoreForm = 'restoreForm',
  SubmitForm = 'submitForm',
}

export enum TimeRange {
  None = 'none',
  Last60Minutes = 'last-60-minutes',
  Last24Hours = 'last-24-hours',
  Last7Days = 'last-7-days',
  Last14Days = 'last-14-days',
  Last30Days = 'last-30-days',
  Last60Days = 'last-60-days',
  Custom = 'custom',
}

export enum FeatureFlag {
  RuleValueTypes = 'rule-value-types',
  VariationSource = 'featureflagmanagement-variation-source',
}

export type WithId<T> = T & { id: string };
