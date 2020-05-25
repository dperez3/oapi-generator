import {
  getOApiDocument,
  getOApiDocuments,
  validateDocument,
  validateDocuments,
  convertToV3,
  identifyVersion,
  Types,
} from '../src/docUtility';
import {
  localV2DocPath,
  remoteV2DocPath,
  localV2Doc,
  localV3Doc,
  localV3DocPath,
} from './utility';
import validator from 'ibm-openapi-validator';

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
        src: localV2DocPath,
        doc: localV2Doc,
      },
      {
        src: localV3DocPath,
        doc: localV3Doc,
      }
    );
    expect(results.length).toBe(2);
    expect(results.map(x => x.docSrc)).toContain(localV2DocPath);
    expect(results[0].result.errors.length).toBe(0);
    expect(results[1].result.errors.length).toBe(0);
  });

  it('can identify document version', () => {
    expect(
      identifyVersion({
        src: '',
        doc: localV2Doc,
      })
    ).toBe(Types.OpenAPIVersion.V2);
    expect(
      identifyVersion({
        src: '',
        doc: localV3Doc,
      })
    ).toBe(Types.OpenAPIVersion.V3);
  });

  it('can convert from v2 to v3', async () => {
    let result = await convertToV3(localV2Doc);
    let validationResult = await validator(result, true);

    expect(result.openapi).toBe('3.0.0');
    expect(validationResult.errors.length).toBe(0);
  });
});
