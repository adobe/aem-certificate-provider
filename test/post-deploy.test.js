/*
 * Copyright 2019 Adobe. All rights reserved.
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
import assert from 'assert';
import { h1NoCache } from '@adobe/fetch';
import { createTargets } from './post-deploy-utils.js';

createTargets().forEach((target) => {
  describe(`Post-Deploy Tests (${target.title()})`, () => {
    const fetchContext = h1NoCache();
    const { fetch } = fetchContext;

    afterEach(() => {
      fetchContext.reset();
    });

    it('index function rejects wrong prefix', async () => {
      const url = target.url('/foo');
      const res = await fetch(url, {
        headers: target.headers,
      });
      assert.strictEqual(res.status, 404);
    }).timeout(50000);

    it('index function rejects wrong requests', async () => {
      const url = target.url('/domain');
      const res = await fetch(url, {
        headers: target.headers,
      });
      assert.strictEqual(res.status, 400);
    }).timeout(50000);
  });
});
