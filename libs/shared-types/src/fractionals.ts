// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export enum FractionalType {
  Contextual = 'contextual',
  WeightOnly = 'weight-only',
}

export interface FractionalsTableColumns {
  id: string;
  weights: FractionalWeight[];
  var: string | null;
  type: FractionalType;
  createdAt: string;
  deletedAt: string | null;
  updatedAt: string;
}

export type FractionalWeight = [string, number];
