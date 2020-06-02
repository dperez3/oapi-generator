import parseImport from '../src/importParser';
import { Configuration } from '../src/configuration';
import { dataDocs, expectations } from './utility';
import './extensions';

jest.mock('../src/ui', () => {
  return {
    __esModule: true,
    default: require('./utility').mockUI,
  };
});

describe('importParser', () => {
  it('can return equal copy with prefixed component paths', async () => {
    const config: Configuration.IDocConfig = {
      componentPathPrefix: 'TestPrefix_',
    };

    expectations.expectResultToHaveImported(
      await parseImport(dataDocs.localV3Doc, config),
      dataDocs.localV3Doc
    );
    expectations.expectResultToHaveImported(
      await parseImport(dataDocs.localV3PetstoreDoc, config),
      dataDocs.localV3PetstoreDoc
    );
    expectations.expectResultToHaveImported(
      await parseImport(dataDocs.localV3UsptoDoc, config),
      dataDocs.localV3UsptoDoc
    );
  });
});
