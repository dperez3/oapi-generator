import { URL } from 'url';
import request from 'request-promise';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

function tryGetUrl(path: string): URL | null {
  try {
    return new URL(path);
  } catch (err) {
    return null;
  }
}

function getLocalJson(path: string): any {
  return JSON.parse(readFileSync(path, { encoding: 'utf8' }));
}

async function getRemoteJson(url: URL): Promise<any> {
  return request.get(url.toString()).then(JSON.parse);
}

export async function getJson(urlOrFilePath: string): Promise<any> {
  let url = tryGetUrl(urlOrFilePath);
  if (url !== null) return await getRemoteJson(url);

  if (existsSync(urlOrFilePath)) return getLocalJson(urlOrFilePath);

  throw new Error(
    `"${urlOrFilePath}" is neither a valid url not a valid local file path.`
  );
}

export function writeJsonToFile(json: object, filePath: string) {
  let parsedPath = path.parse(filePath);

  if (!existsSync(parsedPath.dir)) {
    mkdirSync(parsedPath.dir);
  }

  writeFileSync(filePath, JSON.stringify(json, null, 2));
}
