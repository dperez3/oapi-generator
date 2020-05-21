import { URL } from 'url';
import { existsSync, readFileSync } from 'fs';
import request from 'request-promise';
import { OpenAPIV3, OpenAPIV2 } from 'openapi-types';
import validator from 'ibm-openapi-validator';
import swagger2openapi from 'swagger2openapi';

export interface validatorResultItem {
  path: string;
  message: string;
}

export interface validatorResult {
  errors: [] | [validatorResultItem];
  warnings: [] | [validatorResultItem];
}

type OpenAPIDocument = OpenAPIV2.Document | OpenAPIV3.Document;

function tryGetUrl(path: string): URL | null {
  try {
    return new URL(path);
  } catch (err) {
    return null;
  }
}

async function getRemoteJson(url: URL): Promise<any> {
  return request.get(url.toString()).then(JSON.parse);
}

function getLocalJson(path: string): any {
  return JSON.parse(readFileSync(path, { encoding: 'utf8' }));
}

async function getJson(urlOrFilePath: string): Promise<any> {
  let url = tryGetUrl(urlOrFilePath);
  if (url !== null) return await getRemoteJson(url);

  if (existsSync(urlOrFilePath)) return getLocalJson(urlOrFilePath);

  throw new Error(
    `"${urlOrFilePath}" is neither a valid url not a valid local file path.`
  );
}

export async function getOApiDocument(
  urlOrFilePath: string
): Promise<OpenAPIDocument> {
  return await getJson(urlOrFilePath);
}

export async function getOApiDocuments(
  ...urlsOrFilePaths: string[]
): Promise<{ path: string; doc: OpenAPIDocument }[]> {
  let promises = urlsOrFilePaths.map(async x => {
    return {
      path: x,
      doc: await getOApiDocument(x),
    };
  });

  return await Promise.all(promises);
}

export async function saveOApiDocument(
  document: OpenAPIV3.Document,
  filePath: string
): Promise<void> {
  throw new Error(`Not Implemented: ${document}, ${filePath}`);
}

export async function validateDocument(
  oApiDocument: OpenAPIDocument
): Promise<validatorResult> {
  return await validator(oApiDocument, true);
}

export async function convertToV3(
  openApiV2Document: OpenAPIV2.Document
): Promise<OpenAPIV3.Document> {
  let result = await swagger2openapi.convertObj(openApiV2Document, {});
  return result.openapi;
}
