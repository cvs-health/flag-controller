// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { proxy } from '../proxy';

describe('proxy', () => {
  it('should successfully setup proxy', () => {
    const response = proxy(
      new NextRequest({
        pathname: '/test',
        hostname: 'localhost',
        hash: '',
        host: 'localhost',
        protocol: 'http',
        search: '',
        url: 'http://localhost/test',
        origin: 'http://localhost',
        href: 'http://localhost/test',
        password: '',
        username: '',
        searchParams: new URLSearchParams(),
        port: '',
        toJSON: () => 'http://localhost/test',
      }),
    );

    expect(response.headers.get('x-next-url-pathname')).toEqual('/test');
  });
});
