import {
  getOApiDocument,
  getOApiDocuments,
  validateDocument,
  validateDocuments,
  convertToV3,
  identifyVersion,
  Types,
} from '../src/docUtility';
import { dataPaths, dataDocs } from './utility';
import './extensions';

describe('docUtility', () => {
  it('can get local document', async () => {
    let oapiDocument = await getOApiDocument(dataPaths.localV2DocPath);
    expect(oapiDocument).not.toBeNull();
  });
  it('can get remote document', async () => {
    let oapiDocument = await getOApiDocument(dataPaths.remoteV2DocPath);
    expect(oapiDocument).not.toBeNull();
  });
  it('can get multiple documents', async () => {
    let oapiDocuments = await getOApiDocuments(
      dataPaths.remoteV2DocPath,
      dataPaths.localV2DocPath
    );
    expect(oapiDocuments.length).toBe(2);
    expect(oapiDocuments[0]).not.toBeNull();
    expect(oapiDocuments[1]).not.toBeNull();
  });

  it('can identify document version', () => {
    expect(
      identifyVersion({
        src: '',
        doc: dataDocs.localV2Doc,
      })
    ).toBe(Types.OpenAPIVersion.V2);
    expect(
      identifyVersion({
        src: '',
        doc: dataDocs.localV3Doc,
      })
    ).toBe(Types.OpenAPIVersion.V3);
  });

  it('can convert from v2 to v3', async () => {
    let result = await convertToV3(dataDocs.localV2Doc);

    expect(result.openapi).toBe('3.0.0');
    await expect(result).toBeValidDocument();
  });

  describe('validation', () => {
    it('can validate v2 document', async () => {
      let result = await validateDocument(dataDocs.localV2Doc);
      expect(result.errors.length).toBe(0);
    });
    it('can validate v3 document', async () => {
      let result = await validateDocument(dataDocs.localV3Doc);
      expect(result.errors.length).toBe(0);
    });
    it('can validate multiple documents', async () => {
      let results = await validateDocuments(
        {
          src: dataPaths.localV2DocPath,
          doc: dataDocs.localV2Doc,
        },
        {
          src: dataPaths.localV3DocPath,
          doc: dataDocs.localV3Doc,
        }
      );
      expect(results.length).toBe(2);
      expect(results.map(x => x.docSrc)).toContain(dataPaths.localV2DocPath);
      expect(results[0].result.errors.length).toBe(0);
      expect(results[1].result.errors.length).toBe(0);
    });

    it('can validate erroneous document', async () => {
      let result = await validateDocument({
        info: {
          description: 'I am not a valid document',
        },
      } as any);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
