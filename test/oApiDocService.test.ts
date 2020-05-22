import { readFileSync } from 'fs';
import {
  getOApiDocument,
  getOApiDocuments,
  validateDocument,
  validateDocuments,
  convertToV3,
  identifyVersion,
  OpenAPIVersion,
} from '../src/oApiDocService';
import validator from 'ibm-openapi-validator';

const dataPath = 'test/data';
const localV2DocPath = `${dataPath}/v2-api-with-examples.json`;
const localV2Doc = JSON.parse(
  readFileSync(localV2DocPath, { encoding: 'utf8' })
);
const localV3DocPath = `${dataPath}/v3-api-with-examples.json`;
const localV3Doc = JSON.parse(
  readFileSync(localV3DocPath, { encoding: 'utf8' })
);
const remoteV2DocPath =
  'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/api-with-examples.json';

describe('oApiDocumentService', () => {
  it('can get local document', async () => {
    let oapiDocument = await getOApiDocument(localV2DocPath);
    expect(oapiDocument).not.toBeNull();
  });
  it('can get remote document', async () => {
    let oapiDocument = await getOApiDocument(remoteV2DocPath);
    expect(oapiDocument).not.toBeNull();
  });
  it('can get multiple documents', async () => {
    let oapiDocuments = await getOApiDocuments(remoteV2DocPath, localV2DocPath);
    expect(oapiDocuments.length).toBe(2);
    expect(oapiDocuments[0]).not.toBeNull();
    expect(oapiDocuments[1]).not.toBeNull();
  });

  it('can validate v2 document', async () => {
    let result = await validateDocument(localV2Doc);
    expect(result.errors.length).toBe(0);
  });
  it('can validate v3 document', async () => {
    let result = await validateDocument(localV3Doc);
    expect(result.errors.length).toBe(0);
  });
  it('can validate multiple documents', async () => {
    let results = await validateDocuments(
      {
        key: localV2DocPath,
        doc: localV2Doc,
      },
      {
        key: localV3DocPath,
        doc: localV3Doc,
      }
    );
    expect(results.length).toBe(2);
    expect(results.map(x => x.key)).toContain(localV2DocPath);
    expect(results[0].result.errors.length).toBe(0);
    expect(results[1].result.errors.length).toBe(0);
  });

  it('can identify document version', () => {
    expect(identifyVersion(localV2Doc)).toBe(OpenAPIVersion.V2);
    expect(identifyVersion(localV3Doc)).toBe(OpenAPIVersion.V3);
  });

  it('can convert from v2 to v3', async () => {
    let result = await convertToV3(localV2Doc);
    let validationResult = await validator(result, true);

    expect(result.openapi).toBe('3.0.0');
    expect(validationResult.errors.length).toBe(0);
  });
});
