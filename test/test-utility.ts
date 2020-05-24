import { readFileSync, existsSync, removeSync } from 'fs-extra';
import { OpenAPIV2Document, OpenAPIV3Document } from '../src/docUtility/types';

export const dataPath = 'test/data';
export const localV2DocPath = `${dataPath}/v2-api-with-examples.json`;
export const localV2PetstorePath = `${dataPath}/v2-petstore-expanded.json`;
export const localV2UberPath = `${dataPath}/v2-uber.json`;

export const localV2Doc = readJson(localV2DocPath) as OpenAPIV2Document;
export const localV2PetstoreDoc = readJson(
  localV2PetstorePath
) as OpenAPIV2Document;
export const localV2UberDoc = readJson(localV2UberPath) as OpenAPIV2Document;

export const localV3DocPath = `${dataPath}/v3-api-with-examples.json`;
export const localV3PetstorePath = `${dataPath}/v3-petstore-expanded.json`;
export const localV3UsptoPath = `${dataPath}/v3-uspto.json`;

export const localV3Doc = readJson(localV3DocPath) as OpenAPIV3Document;
export const localV3PetstoreDoc = readJson(
  localV3PetstorePath
) as OpenAPIV3Document;
export const localV3UsptoDoc = readJson(localV3UsptoPath) as OpenAPIV3Document;

export const remoteV2DocPath =
  'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/api-with-examples.json';

export const testBinPath = 'test/bin';
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
