import validator from 'ibm-openapi-validator';
import swagger2openapi from 'swagger2openapi';
import * as Types from './types';
import { getJson, writeJsonToFile } from './io';

export { Types };

export async function getOApiDocument(
  urlOrFilePath: string
): Promise<Types.OpenAPIDocument> {
  return await getJson(urlOrFilePath);
}

export async function getOApiDocuments(
  ...urlsOrFilePaths: string[]
): Promise<Types.DocumentInfo<Types.OpenAPIDocument>[]> {
  let promises = urlsOrFilePaths.map(async x => {
    return {
      src: x,
      doc: await getOApiDocument(x),
    };
  });

  return await Promise.all(promises);
}

export async function saveOApiDocument(
  document: Types.OpenAPIV3Document,
  filePath: string
): Promise<void> {
  writeJsonToFile(document, filePath);
}

export async function validateDocument(
  oApiDocument: Types.OpenAPIDocument
): Promise<Types.ValidatorResult> {
  return await validator(oApiDocument, true);
}

export async function validateDocuments(
  ...oApiDocuments: Types.DocumentInfo<Types.OpenAPIDocument>[]
): Promise<Types.ValidationResult[]> {
  let promises = oApiDocuments.map(async x => {
    return {
      docSrc: x.src,
      result: await validateDocument(x.doc),
    };
  });

  return await Promise.all(promises);
}

export function identifyVersion(
  documentInfo: Types.DocumentInfo<Types.OpenAPIDocument>
): Types.OpenAPIVersion {
  if ((documentInfo.doc as Types.OpenAPIV3Document).openapi !== undefined) {
    return Types.OpenAPIVersion.V3;
  } else if (
    (documentInfo.doc as Types.OpenAPIV2Document).swagger !== undefined
  ) {
    return Types.OpenAPIVersion.V2;
  }

  throw Error(
    `Could not identify version of document from '${documentInfo.src}'.`
  );
}

export async function convertToV3(
  openApiV2Document: Types.OpenAPIV2Document
): Promise<Types.OpenAPIV3Document> {
  let result = await swagger2openapi.convertObj(openApiV2Document, {});
  return result.openapi;
}
