#!/usr/bin/env node

import path from "path";
import yargs from "yargs";
import { createDocAsync } from "./index";
import { Configuration } from "./configuration";

const argDefs = yargs
  .usage(
    `Usage: 'npm run gen-openapi-doc -- --config "./gen-openapi-config/configurations.js"'`
  )
  .option("config", {
    alias: "c",
    demandOption: true,
    describe: `The configuration file to generate the new OpenAPI v3 document(s) with.`,
    type: "string",
    normalize: true,
    coerce: path.resolve
  });

const argv = argDefs.argv;

function getConfigurationFromFile(
  filePath: string
): Configuration.IManyGenOpenAPIV3Configs | Configuration.IGenOpenAPIV3Config {
  return require(filePath);
}

async function generateOneDocAsync(
  config: Configuration.IGenOpenAPIV3Config
): Promise<void> {
  createDocAsync(config).catch(err => {
    console.error(err);
    throw Error(err);
  });
}

async function generateManyDocsAsync(
  configs: Configuration.IManyGenOpenAPIV3Configs
): Promise<void> {
  await Promise.all(configs.genConfigs.map(generateOneDocAsync));
}

let generationConfiguration = getConfigurationFromFile(argv.config);

// if configs for generating many files are specified...
if (
  (generationConfiguration as Configuration.IManyGenOpenAPIV3Configs).genConfigs
) {
  generateManyDocsAsync(
    generationConfiguration as Configuration.IManyGenOpenAPIV3Configs
  );
} else {
  // otherwise, treat as configuration for generating 1 file...
  generateOneDocAsync(
    generationConfiguration as Configuration.IGenOpenAPIV3Config
  );
}
