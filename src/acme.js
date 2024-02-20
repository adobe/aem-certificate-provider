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
import acme from 'acme-client';

function log(m) {
  console.log(m);
}

/**
 * Function used to satisfy an ACME challenge
 *
 * @param {object} authz Authorization object
 * @param {object} challenge Selected challenge
 * @param {string} keyAuthorization Authorization key
 * @returns {Promise}
 */

async function challengeCreate(authz, challenge, keyAuthorization, dnsProvider) {
  log('Triggered challengeCreateFn()');

  if (challenge.type === 'dns-01') {
    const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
    const recordValue = keyAuthorization;

    log(`Creating TXT record for ${authz.identifier.value}: ${dnsRecord}`);

    /* Replace this */
    log(`Would create TXT record "${dnsRecord}" with value "${recordValue}"`);

    await dnsProvider.createRecord(recordValue);
  }
}

/**
 * Function used to remove an ACME challenge response
 *
 * @param {object} authz Authorization object
 * @param {object} challenge Selected challenge
 * @param {string} keyAuthorization Authorization key
 * @returns {Promise}
 */

async function challengeRemove(authz, challenge, keyAuthorization, dnsProvider) {
  log('Triggered challengeRemoveFn()');

  /* dns-01 */
  if (challenge.type === 'dns-01') {
    const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
    const recordValue = keyAuthorization;

    log(`Removing TXT record for ${authz.identifier.value}: ${dnsRecord}`);

    /* Replace this */
    log(`Would remove TXT record "${dnsRecord}" with value "${recordValue}"`);
    await dnsProvider.removeRecord(recordValue);
  }
}

export class Acme {
  constructor(opts, dnsProvider) {
    this.accountEmail = opts.accountEmail;
    this.accountKey = opts.accountKey;
    this.accountUrl = opts.accountUrl;
    this.retries = opts.retries ?? 10;
    this.dnsProvider = dnsProvider;
  }

  async generateCertificate(domain, challengeCNAME) {
    /* Init client */
    const client = new acme.Client({
      directoryUrl: this.accountUrl.includes('staging') ? acme.directory.letsencrypt.staging 
        : acme.directory.letsencrypt.production,
      accountKey: Buffer.from(this.accountKey, 'base64'),
      accountUrl: this.accountUrl.toLowerCase(),
      backoffAttempts: this.retries,
      backoffMin: 5000,
      backoffMax: 30000,
    });

    acme.setLogger(log);

    /* Create CSR */
    const [key, csr] = await acme.crypto.createCsr({
      commonName: domain,
    });

    // this is wrapper on dnsProvider that only take the recordValue as arg
    const dnsProviderWrapper = {
      createRecord: async (recordValue) => {
        await this.dnsProvider.createRecord(challengeCNAME, 'TXT', recordValue, 5);
      },
      removeRecord: async (recordValue) => {
        await this.dnsProvider.removeRecord(challengeCNAME, 'TXT', recordValue, 5);
      },
    };

    const certChain = await client.auto({
      csr,
      email: this.accountEmail,
      termsOfServiceAgreed: true,
      challengePriority: ['dns-01'],
      challengeCreateFn: (authz, challenge, keyAuthorization) => 
        challengeCreate(authz, challenge, keyAuthorization, dnsProviderWrapper),
      challengeRemoveFn: (authz, challenge, keyAuthorization) => 
        challengeRemove(authz, challenge, keyAuthorization, dnsProviderWrapper),
    });

    const [cert, intCert] = certChain.split('\n\n');

    return {
      csr,
      key: key.toString(),
      cert: cert.trim(),
      intCert: intCert.trim(),
    };
  } 
}

export async function createAcmeAccount(accountEmail, useProd) {
  const accountKey = await acme.crypto.createPrivateKey();
  const client = new acme.Client({
    directoryUrl: useProd ? acme.directory.letsencrypt.production: acme.directory.letsencrypt.staging,
    accountKey: accountKey
  });

  /* Register account */
  await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${accountEmail}`]
  });

  const accountUrl = client.getAccountUrl();
  return { accountKey: accountKey.toString('base64'), accountUrl };
}
