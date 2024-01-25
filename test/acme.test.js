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
import { Acme, createAcmeAccount } from '../src/acme.js';
import { DNSProvider } from '../src/dns.js';

describe('ACME Tests', () => {
  before(async () => {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const recordValue = process.env.LETSENCRYPT_CLEAN_TEST_RECORD;

    if (!key || !email || !projectId || !recordValue) {
      return;
    }

    const dnsProvider = await new DNSProvider()
      .withKey(key)
      .withEmail(email)
      .withProjectId(projectId)
      .init();

    await dnsProvider.removeRecord('test-aem-wtf.aemvalidations.net', 'TXT', recordValue, 5);
  });

  it('generateCertificate for real', async function () {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const accountEmail = process.env.LETSENCRYPT_ACCOUNT_EMAIL;
    const accountUrl = process.env.LETSENCRYPT_ACCOUNT_URL;
    const accountKey = process.env.LETSENCRYPT_ACCOUNT_KEY;
  
    if (!key || !email || !projectId || !accountEmail || !accountUrl || !accountKey) {
      this.skip();
    }

    const dnsProvider = await new DNSProvider()
      .withKey(key)
      .withEmail(email)
      .withProjectId(projectId)
      .init();

    const acme = new Acme({ accountEmail, accountKey, accountUrl }, dnsProvider);
    const cert = await acme.generateCertificate('test.aem.wtf', 'test-aem-wtf.aemvalidations.net');

    assert.ok(cert.key);
    assert.ok(cert.csr);
    assert.ok(cert.cert);
  }).timeout(60000);

  it('createAcmeAccount - used for initial setup', async function () {
    const accountEmail = process.env.LETSENCRYPT_ACCOUNT_EMAIL;
    if (!accountEmail) {
      this.skip();
    }

    const useProd = false; // run this locally on production to generate a new production account
    const accountData = await createAcmeAccount(accountEmail, useProd);


    assert.ok(accountData.accountKey);
    assert.ok(accountData.accountUrl);
    // console.log(accountData);
  }).timeout(60000);
});
