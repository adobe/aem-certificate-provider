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
import { isAcmeChallenge, isApexDomain, makeResponse } from './utils.js';

export async function createDomain(domain, request, context) {
  return new Response('Not yet implemented', { status: 201 });
}

export async function issueCertificate(domain, request, context) {
  return new Response('Check status here', {
    status: 301,
    headers: { Location: `/domains/${domain}` },
  });
}

export async function getDomainDetails(domain, request, context, contentType) {
  if (isAcmeChallenge(domain)) {
    const CNAME = `${domain.replace('_acme-challenge.', '').replace(/\./g, '-')}.aemvalidations.net`;
    const json = {
      records: {
        CNAME,
      },
    };
    return makeResponse(json, contentType);
  }
  if (await isApexDomain(domain)) {
    console.log('apex domain', domain);
    const json = {
      records: {
        A: ['151.101.194.117', '151.101.66.117', '151.101.2.117', '151.101.130.117'],
      },
    };
    return makeResponse(json, contentType);
  } else {
    const json = {
      records: {
        CNAME: 'cdn.aem.live',
      },
    };
    return makeResponse(json, contentType);
  }
}
