import './extensions';
import generate from '../src/generator';
import { readJson, testDocPath, clearTestBin, dataPaths } from './utility';
import { OpenAPIV3Document } from '../src/docUtility/types';

jest.mock('../src/ui', () => {
  return {
    __esModule: true,
    default: require('./utility').mockUI,
  };
});

beforeEach(() => {
  clearTestBin();
});

describe('generator', () => {
  it('can run basic configuration', async () => {
    const componentPrefix = 'TestPathPrefix';
    await generate([
      {
        docs: {
          [dataPaths.localV2DocPath]: {
            componentPathPrefix: componentPrefix,
          },
        },
        destination: testDocPath,
      },
    ]);

    let doc = readJson(testDocPath) as OpenAPIV3Document;

    expect(doc).not.toBeNull();
    //expect(doc).toHaveComponents(componentPrefix);
  });
});
