import { URL } from "url";
import { existsSync, readFileSync } from "fs";
import request from "request-promise";
import { OpenAPIV3, OpenAPIV2 } from "openapi-types";
import oasValidator from "oas-validator";

function tryGetUrl(path: string): URL {
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
  return JSON.parse(readFileSync(path, { encoding: "utf8" }));
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
): Promise<OpenAPIV2.Document | OpenAPIV3.Document> {
  return await getJson(urlOrFilePath);
}

export async function isValidOApiDocument(
  oApiDocument: OpenAPIV2.Document | OpenAPIV3.Document
): Promise<boolean> {
  return await oasValidator.validate(oApiDocument, {});
}

export async function convertToV3(
  openApiV2Document: OpenAPIV2.Document
): Promise<OpenAPIV3.Document> {
  throw new Error("Not Implemented");
}

export async function saveOApiDocument(
  document: OpenAPIV3.Document,
  filePath: string
): Promise<void> {
  throw new Error("Not Implemented");
}
