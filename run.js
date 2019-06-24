#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const index_1 = require("./index");
const argDefs = yargs_1.default
    .usage(`Usage: 'npm run gen-openapi-doc -- --config "./gen-openapi-config/configurations.js"'`)
    .option('config', {
    alias: 'c',
    demandOption: true,
    describe: `The configuration file to generate the new OpenAPI v3 document(s) with.`,
    type: 'string',
    normalize: true,
    coerce: path_1.default.resolve
});
const argv = argDefs.argv;
function getConfigurationFromFile(filePath) {
    return require(filePath);
}
function generateOneDocAsync(config) {
    return __awaiter(this, void 0, void 0, function* () {
        index_1.createDocAsync(config)
            .catch(err => {
            console.error(err);
            throw Error(err);
        });
    });
}
function generateManyDocsAsync(configs) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(configs.genConfigs.map(generateOneDocAsync));
    });
}
let generationConfiguration = getConfigurationFromFile(argv.config);
// if configs for generating many files are specified...
if (generationConfiguration.genConfigs) {
    generateManyDocsAsync(generationConfiguration);
}
else { // otherwise, treat as configuration for generating 1 file...
    generateOneDocAsync(generationConfiguration);
}
//# sourceMappingURL=run.js.map