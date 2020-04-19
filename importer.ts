import { URL } from "url";
import { existsSync, readFileSync } from "fs";
import request from "request-promise";

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

async function importJson(urlOrPath: string): Promise<any> {
  let url = tryGetUrl(urlOrPath);
  if (url !== null) return await getRemoteJson(url);

  if (existsSync(urlOrPath)) return getLocalJson(urlOrPath);

  throw new Error(
    `"${urlOrPath}" is neither a valid url not a valid local file path.`
  );
}

export default importJson;
