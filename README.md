# oapi-generator

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
![Node.js CI](https://github.com/dperez3/oapi-generator/workflows/Node.js%20CI/badge.svg)

Generate OpenAPI documents from multiple Swagger v2 or Open API v3 documents.

[npm](https://www.npmjs.com/package/oapi-generator)

- [oapi-generator](#oapi-generator)
  - [Installation](#installation)
    - [Install](#install)
    - [Configure](#configure)
      - [Config File](#config-file)
      - [`package.json`](#packagejson)
  - [Local Development](#local-development)
    - [TSDX Bootstrap](#tsdx-bootstrap)
    - [`npm start` or `yarn start`](#npm-start-or-yarn-start)
    - [`npm run build` or `yarn build`](#npm-run-build-or-yarn-build)
    - [`npm test` or `yarn test`](#npm-test-or-yarn-test)
    - [`npm run cm` or `yarn cm`](#npm-run-cm-or-yarn-cm)
    - [VS Code Tasks](#vs-code-tasks)

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

---

## Local Development

### TSDX Bootstrap

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

Below is a list of commands you will probably find useful.

### `npm start` or `yarn start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

<img src="https://user-images.githubusercontent.com/4060187/52168303-574d3a00-26f6-11e9-9f3b-71dbec9ebfcb.gif" width="600" />

Your library will be rebuilt if you make edits.

### `npm run build` or `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

<img src="https://user-images.githubusercontent.com/4060187/52168322-a98e5b00-26f6-11e9-8cf6-222d716b75ef.gif" width="600" />

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run cm` or `yarn cm`

Conventional commit prompt.

### VS Code Tasks

Tha above NPM scripts can also be invoked via VS Code Tasks.
