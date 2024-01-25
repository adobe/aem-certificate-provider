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
import wrap from '@adobe/helix-shared-wrap';
import { helixStatus } from '@adobe/helix-status';
import secrets from '@adobe/helix-shared-secrets';
import { Response } from '@adobe/fetch';
import { createDomain, issueCertificate, getDomainDetails } from './handlers.js';

/**
 * This is the main function
 * @param {Request} request the request object (see fetch api)
 * @param {UniversalContext} context the context of the universal serverless function
 * @returns {Response} a response
 */
function run(request, context) {
  const url = new URL(request.url);
  const { pathname } = url;
  // pathname is /helix-services/certificate-provider/ci7641176065/domain/example.com
  const parts = pathname.split('/').filter((p) => p.length > 0);
  if (parts.indexOf('domain') === -1) {
    return new Response('This is not the service you\'ve been looking for', { status: 404 });
  }
  const [_, domain] = parts.slice(parts.indexOf('domain'));

  const contentType = (request.headers.get('content-type') || 'text/plain') === 'application/json' ? 'json' : 'text';
  if (request.method === 'POST' && !domain) {
    return createDomain(domain, request, context, contentType);
  }
  if (request.method === 'POST' && domain) {
    return issueCertificate(domain, request, context, contentType);
  }
  if (request.method === 'GET' && domain) {
    return getDomainDetails(domain, request, context, contentType);
  }
  return new Response('Unsupported request', { status: 400 });
}

export const main = wrap(run)
  .with(helixStatus)
  .with(secrets);
