/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import moment, { Moment } from 'moment';
import type { MakeSchemaFrom } from '@kbn/usage-collection-plugin/server';

export interface Usage {
  locale: string;
}

export interface WithUnion {
  prop1: string | null;
  prop2: string | null | undefined;
  prop3?: string | null;
  prop4: 'opt1' | 'opt2';
  prop5: 123 | 431;
}

export interface WithMoment {
  prop1: Moment;
  prop2: moment.Moment;
  prop3: Moment[];
  prop4: Date[];
}

export interface WithConflictingUnion {
  prop1: 123 | 'str';
}

export interface WithUnsupportedUnion {
  prop1: 123 | Moment;
}

export const externallyDefinedSchema: MakeSchemaFrom<{ locale: string }> = {
  locale: {
    type: 'keyword',
  },
};

export type TypeAliasWithUnion = Usage & WithUnion;

export type TypeAliasWithRecord = Usage & Record<string, number>;

export type MappedTypeProps = 'prop1' | 'prop2';

export type MappedTypeExtraProps = 'prop3' | 'prop4';

export type MappedTypeAllProps = MappedTypeProps | MappedTypeExtraProps;

export interface MappedTypes {
  mappedTypeWithExternallyDefinedProps: {
    [key in MappedTypeProps]: number;
  };
  mappedTypeWithOneInlineProp: {
    [key in 'prop3']: number;
  };
  mappedTypeWithLiteralTemplates: {
    [key in MappedTypeProps | `templated_prop/${string}`]: number;
  };
}

export type RecordWithKnownProps = Record<MappedTypeProps, number>;
export type RecordWithKnownAllProps = Record<MappedTypeAllProps, number>;
export type RecordStringUnknown = Record<string, unknown>;

export type IndexedAccessType = Pick<WithUnion, 'prop1' | 'prop2'>;
export type OmitIndexedAccessType = Omit<WithUnion, 'prop1' | 'prop2'>;
