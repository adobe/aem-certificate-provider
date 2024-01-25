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
import { resolveCname, resolve4 } from 'dns';
import { promisify } from 'util';
import { DNS } from '@google-cloud/dns';
import { auth } from './auth.js';
import { isApexDomain } from './utils.js';

const dnsresolvers = {
  CNAME: promisify(resolveCname),
  A: promisify(resolve4),
};
export async function validateRecords(domain, records) {
  const results = await Promise.all(
    Object.entries(records).map(async ([type, value]) => {
      const resolver = dnsresolvers[type];
      if (!resolver) {
        throw new Error(`Unsupported record type ${type}`);
      }
      let resolvedRecords = [];
      try {
        resolvedRecords = await resolver(domain);
      } catch (e) {
        if (e.code !== 'ENODATA') {
          return { errors: `No ${type} records found for ${domain}` };
        }
      }
      const expected = Array.isArray(value) ? value : [value];
      const unexpected = resolvedRecords.filter((record) => !expected.includes(record));
      const missing = expected.filter((record) => !resolvedRecords.includes(record));
      const errors = [
        ...unexpected.map((record) => `Unexpected ${type} record ${record} for ${domain}`),
        ...missing.map((record) => `Missing ${type} record ${record} for ${domain}`),
      ];
      return { errors };
    }),
  );
  // merge results
  const allerrors = results.reduce((acc, { errors }) => [...acc, ...errors], []);
  if (allerrors.length > 0) {
    const consolidatedError = new Error(`DNS validation failed: ${allerrors[0]} and ${allerrors.length - 1} more errors`);
    consolidatedError.errors = allerrors;
    throw consolidatedError;
  }
  return true;
}

export async function getApexDomain(domain) {
  if (await isApexDomain(domain)) {
    return domain;
  }
  const parts = domain.split('.');
  parts.shift();
  if (parts.length <= 2) {
    return parts.join('.');
  }
  return getApexDomain(parts.join('.'));
}

export const dnsProvider = {
  init: async (email, key, projectId) => {
    console.log('init DNS provider');
    const credentials = await auth(email, key.replace(/\\n/g, '\n'));
    this.dns = new DNS({ projectId, credentials });
  },

  createRecord: async (dnsRecord, type, recordValue, ttl) => {
    console.log('create DNS record');
    const zonename = (await getApexDomain(dnsRecord)).replace(/\./g, '-');
    const zone = this.dns.zone(zonename);
    const record = zone.record(type.toLowerCase(), {
      name: dnsRecord,
      ttl,
      data: recordValue,
    });
    await zone.addRecords(record);
  },
  removeRecord: async (dnsRecord, type, recordValue = '', ttl = 1) => {
    console.log('remove DNS record');
    const zonename = (await getApexDomain(dnsRecord)).replace(/\./g, '-');
    const zone = this.dns.zone(zonename);
    const record = zone.record(type.toLowerCase(), {
      name: dnsRecord,
      ttl,
      data: recordValue,
    });
    await zone.deleteRecords(record);
  },
};
