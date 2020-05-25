import parseImport from '../src/importParser';
import { Configuration } from '../src/configuration';
import { localV3PetstoreDoc, localV3Doc, localV3UsptoDoc } from './utility';
import { OpenAPIV3 } from 'openapi-types';
import './extensions';

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
  docToHaveImported: OpenAPIV3.Document,
  expectedComponentPathPrefix: string
  //originalComponents?: OpenAPIV3.ComponentsObject | null
) {
  expect(result).not.toBe(docToHaveImported);

  expect(result.openapi).toEqual(docToHaveImported.openapi);
  expect(result.info).toEqual(docToHaveImported.info);
  expect(result.servers).toEqual(docToHaveImported.servers);
  expect(result.security).toEqual(docToHaveImported.security);
  expect(result.tags).toEqual(docToHaveImported.tags);
  expect(result.externalDocs).toEqual(docToHaveImported.externalDocs);

  const componentSections = Object.values(result.components as object);
  let componentNames =
    componentSections.length > 0
      ? componentSections.map(x => Object.keys(x)).reduce(x => x)
      : [];
  console.log('componentNames', componentNames);

  expect(result.paths).not.toEqual(docToHaveImported.openapi);
  // TODO: Do more extensive check on path $refs

  expect(result.components).not.toEqual(docToHaveImported.components);
  componentNames.forEach(name => {
    expect(name).toStartWith(expectedComponentPathPrefix);
  });
}
