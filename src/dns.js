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
      const resolvedRecords = await resolver(domain);
      if (resolvedRecords.length === 0) {
        return { errors: `No ${type} records found for ${domain}` };
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
