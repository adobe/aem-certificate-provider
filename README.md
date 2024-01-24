# AEM Certificate Provider

> Create ACME Certificate for AEM Services

## Status

TBD

## Installation

## Development

```
POST /domain/ (create a new domain)
    301 /domain/example.com

GET /domain/www.example.com
    CNAME www.example.com. "hlxcdn.adobeaemcloud.com."
    (or as JSON if you set the content type)
    + expiration time
    
GET /domain/example.com
    A example.com. 151.101.194.117
    A example.com. 151.101.66.117
    A example.com. 151.101.2.117
    A example.com. 151.101.130.117
    (or JSON)
    + expiration time

GET /domain/_acme-challenge.example.com
    CNAME "example-com.aemvalidations.net."
    
GET /domain/_acme-challenge.www.example.com
    CNAME "example-com.aemvalidations.net."
    
# User sets DNS records, and then

POST /domain/www.example.com
POST /domain/example.com
    (issue or refresh the certificate with acme)
    301 /domain/www.example.com

+ GitHub action that
1. pulls all domains from ConfigBus
2. checks GET /domain/www.example.com
3. keeps only expiring
4. refreshes POST /domain/www.example.com
```