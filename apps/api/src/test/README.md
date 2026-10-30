# Test Utilities

This directory defines the standard way to write tests in the API project.

## Testing Rules

1. Route tests

- Use the test build function: `build()` from `test/app.js`.
- Services are already mocked for you through `mockServices`.
- Assert route behavior by:
  - checking response status/body
  - checking service calls with arguments (`toHaveBeenCalledExactlyOnceWith`, etc.)
- Do not mock repositories in route tests unless there is an edge case where a route intentionally bypasses services.

2. Service tests

- Build real service instances with `createServiceWithMocks` from `test/testUtils.js`.
- Mock repository behavior through `mockRepositories`.
- `withTransaction` is a passthrough that runs the callback with `mockRepositories`. No transaction is opened.
- Mock repository calls inside `withTransaction` like any other.
- Assert:
  - service return values/errors
  - repository method calls and arguments

3. Repository tests

- Only mock Drizzle behavior using `mockDb()` from `test/mockDb.js`.
- Configure method return values on the `MockMethods` object returned by `mockDb()`.
- Do not mock service-layer helpers in repository tests.
- Repositories don't manage transactions, so do not assert on transaction specifics or calls.

## Standard Setup

No explicit setup helper is required in tests.

- Vitest `mockReset: true` resets mock state automatically between tests.
- Import the helpers you need directly from `test/testUtils.js`.

## Route Test Pattern

```ts
import build from 'test/app.js';
import { mockServices } from 'test/testUtils.js';
describe('GET /feature-flags', () => {
  it('returns feature flags', async () => {
    vi.mocked(mockServices.featureFlags.getFeatureFlags).mockResolvedValue([{ key: 'flag-1' }]);

    const app = build();

    const response = await app.inject({
      method: 'GET',
      url: '/feature-flags',
    });

    expect(response.statusCode).toEqual(200);
    expect(mockServices.featureFlags.getFeatureFlags).toHaveBeenCalledExactlyOnceWith();
  });
});
```

## Service Test Pattern

```ts
import { createServiceWithMocks, mockRepositories } from 'test/testUtils.js';
describe('featureFlagService', () => {
  describe('createFlag', () => {
    it('creates a flag', async () => {
      vi.mocked(mockRepositories.featureFlags.findByKey).mockResolvedValue(null);

      const service = createServiceWithMocks.featureFlag;
      await service.createFlag({ key: 'flag-1' });

      expect(mockRepositories.featureFlags.findByKey).toHaveBeenCalledExactlyOnceWith('flag-1');
    });
  });
});
```

## Repository Test Pattern

```ts
import mockDb from 'test/mockDb.js';
import createFeatureFlagsRepository from 'repositories/featureFlagsRepository.js';

describe('featureFlagsRepository', () => {
  describe('findAll', () => {
    it('returns rows', async () => {
      const [db, methods] = mockDb();
      methods.execute.mockResolvedValue([{ id: '1', key: 'flag-1' }]);

      const repository = createFeatureFlagsRepository(db);
      const rows = await repository.findAll();

      expect(rows).toEqual([{ id: '1', key: 'flag-1' }]);
    });
  });
});
```
