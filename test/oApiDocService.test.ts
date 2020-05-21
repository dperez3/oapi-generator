import { getOApiDocument, validateDocument } from '../src/oApiDocService';
import { readFileSync } from 'fs';

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
  it('can validate v2 document', async () => {
    let result = await validateDocument(localV2Doc);
    expect(result.errors.length).toBe(0);
  });
  it('can validate v3 document', async () => {
    let result = await validateDocument(localV3Doc);
    expect(result.errors.length).toBe(0);
  });

  it('can get local document', async () => {
    let oapiDocument = await getOApiDocument(localV2DocPath);
    expect(oapiDocument).not.toBeNull();
  });

  it('can get remote document', async () => {
    let oapiDocument = await getOApiDocument(remoteV2DocPath);
    expect(oapiDocument).not.toBeNull();
  });
});
