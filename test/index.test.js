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
import { Request } from '@adobe/fetch';
import { main } from '../src/index.js';

describe('Index Tests', () => {
  it('index function rejects wrong prefix', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/foo'), {
      logger: console,
    });
    assert.strictEqual(await result.text(), 'This is not the service you\'ve been looking for');
  });

  it('index function rejects wrong requests', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain'), {
      logger: console,
    });
    assert.strictEqual(result.status, 400);
  });

  it('index function handles non-apex domains', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/www.example.com'), {
      logger: console,
    });
    assert.strictEqual(result.status, 202);
    const text = await result.text();
    assert.ok(text.includes('Please create following DNS records:'));
    assert.ok(text.includes('CNAME: cdn.aem.live'), text);
    assert.ok(result.headers.get('x-remaining-certificate-validity'), 'Missing remaining certificate validity header');
    assert.ok(Number.parseInt(result.headers.get('x-remaining-certificate-validity'), 10) > 0, 'Remaining certificate validity is not positive');
  });

  it('index function handles apex domains', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/example.com'), {
      logger: console,
    });
    assert.strictEqual(result.status, 202);
    const text = await result.text();
    assert.ok(text.includes('Please create following DNS records:'));
    assert.ok(text.includes('A: 151.101.66.117'), text);
  });

  it('index function handles acme-challenge domains', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/_acme-challenge.example.com'), {
      logger: console,
    });
    assert.strictEqual(result.status, 202);
    const text = await result.text();
    assert.ok(text.includes('Please create following DNS records:'));
    assert.ok(text.includes('CNAME: example-com.aemvalidations.net'), text);
  });

  it('index function handles correct acme-challenge domains', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/_acme-challenge.aem.page'), {
      logger: console,
    });
    assert.strictEqual(result.status, 200);
    const text = await result.text();
    assert.ok(text.includes('Please create following DNS records:'));
    assert.ok(text.includes('CNAME: aem-page.aemvalidations.net'), text);
  });

  it('index function handles apex as JSON', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/example.com', {
      headers: {
        'Content-Type': 'application/json',
      },
    }), {
      logger: console,
    });
    assert.strictEqual(result.status, 202);
    const json = await result.json();
    assert.deepStrictEqual(json, {
      records: {
        A: [
          '151.101.194.117',
          '151.101.66.117',
          '151.101.2.117',
          '151.101.130.117'],
      },
      errors: [
        'Unexpected A record 93.184.216.34 for example.com',
        'Missing A record 151.101.194.117 for example.com',
        'Missing A record 151.101.66.117 for example.com',
        'Missing A record 151.101.2.117 for example.com',
        'Missing A record 151.101.130.117 for example.com',
      ],
    });
  });

  it('index function handles expired non-apex as JSON', async () => {
    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/expired.badssl.com', {
      headers: {
        'Content-Type': 'application/json',
      },
    }), {
      logger: console,
    });
    assert.strictEqual(result.status, 202);
    const json = await result.json();
    assert.deepStrictEqual(json.records, {
      CNAME: 'cdn.aem.live',

    });
    assert.equal(json.errors.length, 3, 'Expected 3 errors');
    assert.equal(json.errors[0], 'Missing CNAME record cdn.aem.live for expired.badssl.com');
    assert.ok(json.errors[1].includes('Certificate is not valid'));
    assert.ok(json.errors[2].includes('Certificate expired on '));
  }).timeout(60000);

  it('index function issues certificate', async function () {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const accountEmail = process.env.LETSENCRYPT_ACCOUNT_EMAIL;

    if (!key || !email || !projectId || !accountEmail) {
      this.skip();
    }

    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/test.aem.wtf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }), {
      logger: console,
    });
    assert.strictEqual(result.status, 201);
    const json = await result.json();
    assert.ok(json.certificate);
    assert.ok(json.certificate.includes('-----BEGIN CERTIFICATE-----'));
    assert.ok(json.intermediate);
    assert.ok(json.intermediate.includes('-----BEGIN CERTIFICATE-----'));
  }).timeout(60000);

  it('index function does not issue certificate', async function () {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const accountEmail = process.env.LETSENCRYPT_ACCOUNT_EMAIL;

    if (!key || !email || !projectId || !accountEmail) {
      this.skip();
    }

    process.env.LETSENCRYPT_RETRIES = 1;

    const result = await main(new Request('https://localhost/helix-services/certificate-provider/ci7641176065/domain/wrong.aem.wtf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }), {
      logger: console,
    });
    assert.strictEqual(result.status, 201);
    const json = await result.json();
    assert.ok(json.errors[0].includes('No TXT records found for name'));
  }).timeout(60000);
});
