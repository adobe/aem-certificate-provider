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
import { logger as unilogger } from '@adobe/helix-universal-logger';
import { helixStatus } from '@adobe/helix-status';
import { Response } from '@adobe/fetch';
import { createDomain, issueCertificate, getDomainDetails } from './handlers';

/**
 * This is the main function
 * @param {Request} request the request object (see fetch api)
 * @param {UniversalContext} context the context of the universal serverless function
 * @returns {Response} a response
 */
function run(request, context) {
  const { logger } = context;
  const url = new URL(request.url);
  const { pathname } = url;
  const [prefix, domain] = pathname.split('/');
  const contentType = (request.headers.get('content-type') || 'text/plain') === 'application/json' ? 'json' : 'text';
  if (prefix !== 'domains') {
    return new Response('This is not the service you\'ve been looking for', { status: 404 });
  }
  if (request.method === 'POST' && !domain) {
    return createDomain(domain, request, context, contentType);
  }
  if (request.method === 'POST' && domain) {
    return issueCertificate(domain, request, context, contentType);
  }
  if (request.method === 'GET' && domain) {
    return getDomainDetails(domain, request, context, contentType);
  }
  logger.error('Unsupported request', request.method, request.url);
  return new Response('Unsupported request', { status: 400 });
}

export const main = wrap(run)
  .with(helixStatus)
  .with(unilogger.trace)
  .with(unilogger);
