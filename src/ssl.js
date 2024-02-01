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
import https from 'https';

export async function getCertificate(url) {
  const p = new Promise((resolve, reject) => {
    const req = https.request(url, {
      requestCert: true, // we want this, after all
      rejectUnauthorized: false, // we don't care about self-signed certs or expired certs
    }, (res) => {
      const cert = res.socket.getPeerCertificate();
      // don't forget to close the connection!
      res.socket.end();
      if (cert) {
        resolve(cert);
      } else {
        reject(new Error('No certificate found'));
      }
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
  return p;
}

/**
 * Get the validity date of the TLS certificate for a given URL
 * @param {string} url the URL to check, must start with https://
 */
export async function getCertificateValidity(url) {
  const cert = await getCertificate(url);
  return new Date(cert.valid_to);
}
