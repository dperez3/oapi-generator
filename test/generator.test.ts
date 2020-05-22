import run from '../src/generator';
import {
  localV2DocPath,
  readFile,
  testDocPath,
  clearTestBin,
} from './test-utility';
import { OpenAPIV3Document } from '../src/docUtility/types';

beforeEach(() => {
  clearTestBin();
});

describe('generator', () => {
  it('can run basic configuration', async () => {
    await run([
      {
        docs: {
          [localV2DocPath]: {},
        },
        destination: testDocPath,
      },
    ]);

    let doc = readFile(testDocPath) as OpenAPIV3Document;

    expect(doc).not.toBeNull();
  });
});
