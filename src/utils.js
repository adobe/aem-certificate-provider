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
import { Response } from '@adobe/fetch';
import { resolveSoa } from 'dns';
import { promisify } from 'util';

const resolveSoaAsync = promisify(resolveSoa);

export async function isApexDomain(domain) {
  try {
    const soaRecords = await resolveSoaAsync(domain);
    return !!soaRecords;
  } catch (e) {
    return false;
  }
}

export function isAcmeChallenge(domain) {
  return domain.split('.')[0] === '_acme-challenge';
}

export function makeResponse(json, type, status = 200, dnserrors = [], extraHeaders = {}) {
  const headers = {
    ...extraHeaders,
    'Content-Type': type === 'json' ? 'application/json' : 'text/plain',
  };
  if (dnserrors.length > 0) {
    [headers['X-Error']] = dnserrors;
  }
  if (type === 'json') {
    return new Response(JSON.stringify({ ...json, errors: dnserrors }), {
      status,
      headers,
    });
  }
  return new Response(Object
    .entries(json.records)
    .reduce(
      (acc, [key, value]) => `${acc}
${key}: ${Array.isArray(value) ? value.join(`\n${key}: `) : value}\n`,
      'Please create following DNS records: ',
    ), {
    status,
    headers,
  });
}
