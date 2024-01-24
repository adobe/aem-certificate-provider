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

export async function createDomain(domain, request, context) {
  const { logger } = context;
  logger.info('Not doing anything', domain);
  return new Response('Not yet implemented', { status: 201 });
}

export async function issueCertificate(domain, request, context) {
  const { logger } = context;
  logger.info('Not doing anything', domain);
  return new Response('Check status here', {
    status: 301,
    headers: { Location: `/domains/${domain}` },
  });
}

export async function getDomainDetails(domain, request, context, contentType) {
  const { logger } = context;
  logger.info('Not doing anything', domain, contentType);
  return new Response('Not yet implemented', { status: 200 });
}