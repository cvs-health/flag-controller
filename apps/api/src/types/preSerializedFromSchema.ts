import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

// Timestamp columns are native Date objects in code but serialized to ISO date-time
// strings on the wire by fast-json-stringify. This maps date-time schema fields to Date
// so route reply payloads accept the Date values returned by services/repositories.
// Output is `Date | null` uniformly: non-null Date values remain assignable, and nullable
// columns (e.g. deletedAt) keep their null branch.
export type PreSerializedFromSchema<S extends JSONSchema> = FromSchema<
  S,
  {
    deserialize: [
      {
        pattern: {
          type: ['string', 'null'];
          format: 'date-time';
        };
        output: Date | null;
      },
      {
        pattern: {
          type: 'string';
          format: 'date-time';
        };
        output: Date | null;
      },
    ];
  }
>;
