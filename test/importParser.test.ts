import parseImport from '../src/importParser';
import { Configuration } from '../src/configuration';
import { localV3PetstoreDoc, localV3Doc, localV3UsptoDoc } from './utility';
import { OpenAPIV3 } from 'openapi-types';
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

    expectResultToHaveImported(
      await parseImport(localV3Doc, config),
      localV3Doc,
      config.componentPathPrefix
    );
    expectResultToHaveImported(
      await parseImport(localV3PetstoreDoc, config),
      localV3PetstoreDoc,
      config.componentPathPrefix
    );
    expectResultToHaveImported(
      await parseImport(localV3UsptoDoc, config),
      localV3UsptoDoc,
      config.componentPathPrefix
    );
  });
});

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
