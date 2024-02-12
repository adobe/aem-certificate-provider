# [1.2.0](https://github.com/adobe/aem-certificate-provider/compare/v1.1.1...v1.2.0) (2024-02-12)


### Bug Fixes

* **ssl:** do not permit tls session cache ([82786b1](https://github.com/adobe/aem-certificate-provider/commit/82786b15b08823273c8231ce62f436ef74c0fcb0))
* **ssl:** more roubust ssl validation ([c98b17e](https://github.com/adobe/aem-certificate-provider/commit/c98b17e4c745f52e1c49eba6534a2571cea44eab))


### Features

* **index:** report on remaining or missing certificate validity ([4f99433](https://github.com/adobe/aem-certificate-provider/commit/4f994333d6f0b61dbd6725fd25654f10207bc247))
* **ssl:** some utility functions for certificate validation ([00f7e27](https://github.com/adobe/aem-certificate-provider/commit/00f7e2700d3af4a62b7e7a0b1d56f9dd0ea87f69))

## [1.1.1](https://github.com/adobe/aem-certificate-provider/compare/v1.1.0...v1.1.1) (2024-01-25)


### Bug Fixes

* **index:** change wrapping order ([8dc5c79](https://github.com/adobe/aem-certificate-provider/commit/8dc5c798fdd09125a9d254f6278d30ac70d436cb))
* **index:** use secrets from AWS ([480cab7](https://github.com/adobe/aem-certificate-provider/commit/480cab7773ee60e16be980021c9bc35dfc569c04))

# [1.1.0](https://github.com/adobe/aem-certificate-provider/compare/v1.0.0...v1.1.0) (2024-01-25)


### Bug Fixes

* **dns:** check apexness of domain by validating presence of a SOA record ([6b0cfd3](https://github.com/adobe/aem-certificate-provider/commit/6b0cfd33d86a70e6b037a3d8220d69522e11f0d8))
* **dns:** fix google dns creation and apex testing ([42f5558](https://github.com/adobe/aem-certificate-provider/commit/42f55588cc786d4bf87b2b884b81e26e4877ad50))


### Features

* **dns:** add helper functions for creating and deleting records ([46a6771](https://github.com/adobe/aem-certificate-provider/commit/46a6771d2babb93cbd1a6c7a58c2fbe6d0e428e6))
* **google:** copy basic google auth from helix-run-query ([a3b7a56](https://github.com/adobe/aem-certificate-provider/commit/a3b7a560e69109e9e0926d1de1dc0ce549197bf9))

# 1.0.0 (2024-01-25)


### Bug Fixes

* **index:** fix path handling and post-deploy test ([b341d99](https://github.com/adobe/aem-certificate-provider/commit/b341d99212ccb135e5abafe968687e993d9e3a8a))
* **index:** log only using console.log ([b3136a9](https://github.com/adobe/aem-certificate-provider/commit/b3136a9c4d5f35f51cb64bfd1963cb8574b75d26))
* **index:** retry logging ([a871901](https://github.com/adobe/aem-certificate-provider/commit/a8719012e295cd10483a641d608ab389fd75a931))
* **index:** use correct import ([bc00617](https://github.com/adobe/aem-certificate-provider/commit/bc006170b94f5b113646b254a3c517f2d2680f20))
* **index:** use correct prefix ([851dfbf](https://github.com/adobe/aem-certificate-provider/commit/851dfbfe81c8c177ceb160435fcacc069a1a2009))


### Features

* **dns:** add function to validate a bunch of DNS records and report missing and unexpected errors ([d1ca3a2](https://github.com/adobe/aem-certificate-provider/commit/d1ca3a2af72d81c3e6e10a54aa4fbdcdb691b0ad))
* **get:** perform dns validation ([b2192ae](https://github.com/adobe/aem-certificate-provider/commit/b2192aec411414fa3ab6c4f82d09f258653ca531))
* **index:** implement most of GET ([bd3796a](https://github.com/adobe/aem-certificate-provider/commit/bd3796a26bd501058df42a5cfc5000879204be88))
* mock implementation ([52cb902](https://github.com/adobe/aem-certificate-provider/commit/52cb902b7aafc2435d7c86b98ff28a2520d75282))
