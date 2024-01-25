/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */

import assert, { fail } from 'assert';
import { validateRecords } from '../src/dns.js';

describe('DNS Tests', () => {
  it('validateRecords complains about invalid records', async () => {
    try {
      await validateRecords('example.com', { FOO: 'bar' });
      fail('should have thrown');
    } catch (e) {
      assert.strictEqual(e.message, 'Unsupported record type FOO');
    }
  });

  it('validateRecords complains about lacking records', async () => {
    try {
      await validateRecords('example.com', { CNAME: 'bar' });
      fail('should have thrown');
    } catch (e) {
      assert.strictEqual(e.message, 'DNS validation failed: Missing CNAME record bar for example.com and 0 more errors');
    }
  });
});
