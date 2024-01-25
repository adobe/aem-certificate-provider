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

import assert from 'assert';
import { getCertificateValidity, checkCertificate } from '../src/ssl.js';

describe('Test SSL Utils', () => {
  it('www.example.com has a valid certificate', async () => {
    const valid = await getCertificateValidity('https://www.example.com');
    assert.ok(valid > new Date(), `Certificate is expired on ${valid}`);
    await checkCertificate('https://www.example.com');
  }).timeout(20000);

  it('expired.badssl.com has an expired certificate', async () => {
    const valid = await getCertificateValidity('https://expired.badssl.com');
    assert.ok(valid < new Date(), `Certificate is still valid until ${valid}`);
  }).timeout(20000);

  it('nope.example.com does not resolve', async () => {
    try {
      await getCertificateValidity('https://nope.example.com');
      assert.fail('Expected an error');
    } catch (e) {
      assert.ok(e.message.includes('getaddrinfo ENOTFOUND nope.example.com'));
    }
  }).timeout(20000);

  it('wrong-host.badssl.com has a no matching host', async () => {
    try {
      await checkCertificate('https://wrong-host.badssl.com');
      assert.fail('Expected an error');
    } catch (e) {
      if (e.message === 'Expected an error') {
        throw e;
      }
    }
  }).timeout(20000);

  it('revoked.badssl.com is revoked', async () => {
    try {
      await checkCertificate('https://revoked.badssl.com');
      assert.fail('Expected an error');
    } catch (e) {
      if (e.message === 'Expected an error') {
        throw e;
      }
    }
  }).timeout(10000);
});
