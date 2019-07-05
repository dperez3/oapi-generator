# oapi-generator

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![buddy pipeline](https://app.buddy.works/dperez3iii/oapi-generator/pipelines/pipeline/194390/badge.svg?token=3c7d484bbe0003aba1918844243f2752a904e06cb52dc12bbedee9ceeae78646 "buddy pipeline")](https://app.buddy.works/dperez3iii/oapi-generator/pipelines/pipeline/194390)

Generate OpenAPI documents from multiple Swagger v2 or Open API v3 documents.

[npm](https://www.npmjs.com/package/oapi-generator)

## Installation

### Install

```bash
npm install --save-dev oapi-generator
npm install --save-dev openapi-types@1.3.4
```

### Configure

#### Config File

Javascript

```js
const v1GenDoc = { /*...*/ };

const v2GenDoc = { /*...*/ };

const config =
{
  genConfigs: [v1GenDoc, v2GenDoc]
};
```

Or TypeScript

```ts
import { Configuration } from "oapi-generator/configuration";
import { OpenAPIV3 } from "openapi-types";

const v1GenDoc: Configuration.IGenOpenAPIV3Config = { /*...*/ };

const v2GenDoc: Configuration.IGenOpenAPIV3Config = { /*...*/ };

const config: Configuration.IManyGenOpenAPIV3Configs =
{
  genConfigs: [v1GenDoc, v2GenDoc]
};

export = config;
```

`openapi-types` combined with TypesScript intellisense provides the easiest way to understand the configuration API.

#### `package.json`

```json
{
  "scripts": {
    "oapi-gen:run": "oapi-generator --config {path_to_above_config_file}"
  }
}
```
