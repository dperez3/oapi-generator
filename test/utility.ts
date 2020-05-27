import { readFileSync, existsSync, removeSync } from 'fs-extra';
import { OpenAPIV2Document, OpenAPIV3Document } from '../src/docUtility/types';
import { OpenAPIV3 } from 'openapi-types';
import 'jest';
import './extensions';

const dataPath = 'test/data';
const testBinPath = 'test/bin';

export const dataPaths = {
  localV2DocPath: `${dataPath}/v2-api-with-examples.json`,
  localV2PetstorePath: `${dataPath}/v2-petstore-expanded.json`,
  localV2UberPath: `${dataPath}/v2-uber.json`,

  localV3DocPath: `${dataPath}/v3-api-with-examples.json`,
  localV3PetstorePath: `${dataPath}/v3-petstore-expanded.json`,
  localV3UsptoPath: `${dataPath}/v3-uspto.json`,

  remoteV2DocPath:
    'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/api-with-examples.json',
};

export const dataDocs = {
  localV2Doc: readJson(dataPaths.localV2DocPath) as OpenAPIV2Document,
  localV2PetstoreDoc: readJson(
    dataPaths.localV2PetstorePath
  ) as OpenAPIV2Document,
  localV2UberDoc: readJson(dataPaths.localV2UberPath) as OpenAPIV2Document,

  localV3Doc: readJson(dataPaths.localV3DocPath) as OpenAPIV3Document,
  localV3PetstoreDoc: readJson(
    dataPaths.localV3PetstorePath
  ) as OpenAPIV3Document,
  localV3UsptoDoc: readJson(dataPaths.localV3UsptoPath) as OpenAPIV3Document,
};

export const testDocPath = `${testBinPath}/testDoc.json`;

export function readJson(src: string) {
  return JSON.parse(readFileSync(src, { encoding: 'utf8' }));
}

export function clearTestBin() {
  if (existsSync(testBinPath)) {
    removeSync(testBinPath);
  }
}

export const mockUI: MockUI = {
  write: jest.fn(),
  writeLine: jest.fn(),
  writeInfoLine: jest.fn(),
  writeWarnLine: jest.fn(),
  writeDebugLine: jest.fn(),
  writeError: jest.fn(),
  writeDeprecateLine: jest.fn(),
  setWriteLevel: jest.fn(),
  startProgress: jest.fn(),
  stopProgress: jest.fn(),
  prompt: jest.fn(),
};

export type MockUI = {
  write: jest.Mock;
  writeLine: jest.Mock;
  writeInfoLine: jest.Mock;
  writeWarnLine: jest.Mock;
  writeDebugLine: jest.Mock;
  writeError: jest.Mock;
  writeDeprecateLine: jest.Mock;
  setWriteLevel: jest.Mock;
  startProgress: jest.Mock;
  stopProgress: jest.Mock;
  prompt: jest.Mock;
};

//////////////////////

export const expectations = {
  expectResultToHaveImported,
};

function expectResultToHaveImported(
  result: OpenAPIV3.Document,
  docToHaveBeenImported: OpenAPIV3.Document,
  expectedComponentPathPrefix: string
) {
  expect(result).not.toBe(docToHaveBeenImported);

  expect(result.openapi).toEqual(docToHaveBeenImported.openapi);
  expect(result.info).toEqual(docToHaveBeenImported.info);
  expect(result.servers).toEqual(docToHaveBeenImported.servers);
  expect(result.security).toEqual(docToHaveBeenImported.security);
  expect(result.tags).toEqual(docToHaveBeenImported.tags);
  expect(result.externalDocs).toEqual(docToHaveBeenImported.externalDocs);

  const componentSections = Object.values(result.components as object);
  let componentNames =
    componentSections.length > 0
      ? componentSections.map(x => Object.keys(x)).reduce(x => x)
      : [];

  expect(result.paths).not.toEqual(docToHaveBeenImported.openapi);
  // TODO: Do more extensive check on path $refs

  expect(result.components).not.toEqual(docToHaveBeenImported.components);
  componentNames.forEach(name => {
    expect(name).toStartWith(expectedComponentPathPrefix);
  });
}