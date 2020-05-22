import { readFileSync, rmdirSync, existsSync } from 'fs';

export const testBinPath = 'test/bin';
export const testDocPath = `${testBinPath}/testDoc.json`;

export const dataPath = 'test/data';
export const localV2DocPath = `${dataPath}/v2-api-with-examples.json`;
export const localV2Doc = JSON.parse(readFile(localV2DocPath));
export const localV3DocPath = `${dataPath}/v3-api-with-examples.json`;
export const localV3Doc = JSON.parse(readFile(localV3DocPath));
export const remoteV2DocPath =
  'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/api-with-examples.json';

export function readFile(src: string): any {
  return readFileSync(src, { encoding: 'utf8' });
}

export function clearTestBin() {
  if (existsSync(testBinPath)) {
    rmdirSync(testBinPath);
  }
}
