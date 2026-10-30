import { describe, expect, it } from 'vitest';

import { GET } from '../route';

describe('healthz', () => {
  it('should return a 200 with an ok status', async () => {
    const response = GET();

    expect(response.status).toEqual(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
