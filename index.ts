#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import request from 'request-promise';
import converter from 'swagger2openapi';
import { OpenAPIV3, OpenAPIV2 } from "openapi-types";
import deepExtend from 'deep-extend';
import pointer from 'json-pointer';
import { Configuration } from './configuration';

const V2_REGEX = /2.*/;
const V3_REGEX = /3.*/;


async function getURLJsonAsync(url: string): Promise<any> {
  return request
    .get(url)
    .then(JSON.parse);
}

function getJsonByFilePath(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
}

async function asOpenAPIV3Async(doc: OpenAPIV2.Document | OpenAPIV3.Document): Promise<OpenAPIV3.Document> {
  let
    v2Doc = doc as OpenAPIV2.Document,
    v3Doc = doc as OpenAPIV3.Document,
    isV2Doc = v2Doc.swagger && V2_REGEX.test(v2Doc.swagger),
    isV3Doc = v3Doc.openapi && V3_REGEX.test(v3Doc.openapi);

  if (isV2Doc) {
    let res = await converter.convertObj(v2Doc, {});
    return res.openapi;
  } else if (isV3Doc) {
    return v3Doc;
  } else {
    throw Error('Document not recognized as Swagger 2.x nor OpenAPI 3.x.');
  }
}

function writeJsonToFile(json: object, filePath: string) {
  let parsedPath = path.parse(filePath);

  if (!fs.existsSync(parsedPath.dir)) {
    fs.mkdirSync(parsedPath.dir);
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

function getPathsToImport(originalDocPaths: OpenAPIV3.PathObject, pathsConfiguration: Configuration.IPathsConfig): OpenAPIV3.PathObject {
  let docPaths = JSON.parse(JSON.stringify(originalDocPaths)) as OpenAPIV3.PathObject; // make copy, so the original isn't altered

  // If no configuration is present, keep all original paths
  if (pathsConfiguration == null) return;
  if (Object.keys(pathsConfiguration).length <= 0) return;


  for (let path in docPaths) {
    // Clear paths not found in configuration
    if (!pathsConfiguration.hasOwnProperty(path)) {
      delete docPaths[path];
      continue;
    }

    // Set new tags
    let newTags = pathsConfiguration[path].tags;
    if (newTags) {
      let docPath = docPaths[path];

      if(docPath.get) docPath.get.tags = newTags;
      if(docPath.put) docPath.put.tags = newTags;
      if(docPath.post) docPath.post.tags = newTags;
      if(docPath.delete) docPath.delete.tags = newTags;
      if(docPath.options) docPath.options.tags = newTags;
      if(docPath.head) docPath.head.tags = newTags;
      if(docPath.patch) docPath.patch.tags = newTags;
      if(docPath.trace) docPath.trace.tags = newTags;
    }

    // Set new path names
    if (pathsConfiguration[path].newName) {
      docPaths[pathsConfiguration[path].newName] = docPaths[path];
      delete docPaths[path];
    }

    // Run configured path hooks
    let config = pathsConfiguration[path];
    let docPath = docPaths[config.newName];

    if (config.onPathComplete) config.onPathComplete(docPath);
  }

  return docPaths;
}

function getAllReferencingObjectsInObject(objectToSearch: any): { $ref: string }[] {
  // deep object search for properties named '$ref'
  let results: { '$ref': string }[] = [];

  if (objectToSearch instanceof Array) {
    let referencedComponents =
      (objectToSearch as Array<any>)
        .map(getAllReferencingObjectsInObject);

    results = results.concat(...referencedComponents);
  }
  else {
    for (let prop in objectToSearch) {
      let propValue = objectToSearch[prop];

      if (prop == '$ref') {
        results.push(objectToSearch);
      } else if (propValue instanceof Object || propValue instanceof Array) {
        results = results.concat(getAllReferencingObjectsInObject(propValue));
      }
    }
  }

  return results;
}

function getAllReferencedComponentsInObject(rootObject: object, objectToSearch: any): IReferencedComponent[] {

  let referencingObjects = getAllReferencingObjectsInObject(objectToSearch);

  // Distinct referencing objects
  let distinctReferencingObjects = [] as string[];
  let map = new Map<string, object>();
  for (let obj of referencingObjects) {
    if (!map.has(obj.$ref)) {
      map.set(obj.$ref, obj); // set any value to Map
      distinctReferencingObjects.push(obj.$ref);
    }
  }

  return distinctReferencingObjects
    .map(x => {
      let strictPath = x.substr(1);
      return {
        path: strictPath,
        obj: pointer.get(rootObject, strictPath)
      } as IReferencedComponent;
    });
}

function getComponentsToImport(doc: OpenAPIV3.Document, paths: string[]): OpenAPIV3.ComponentsObject {

  let groupsOfReferencedComponents =
    paths
      .map(x => doc.paths[x])
      .map(x => getAllReferencedComponentsInObject(doc, x));

  let referencedComponents = ([] as IReferencedComponent[])
    .concat(...groupsOfReferencedComponents);

  // We must go deeper... Recursive search through results (Find components referenced by referenced components)
  let recursiveResults: IReferencedComponent[] = referencedComponents;
  do {
    let recursiveRefGroup = recursiveResults
      .map(x => {
        return getAllReferencedComponentsInObject(doc, x.obj);
      })
      .filter(x => x.length > 0);

    // next level
    recursiveResults = [].concat(...recursiveRefGroup);

    referencedComponents = referencedComponents.concat(...recursiveResults);
  } while (recursiveResults.length > 0);


  let newDoc = {} as OpenAPIV3.Document;
  referencedComponents
    .forEach(x => {
      pointer.set(newDoc, x.path, x.obj);
    });

  return newDoc.components;
}

function createNewPath(originalPath: string, pathPrefix: string): string {
  let afterLastSlashIndex = originalPath.lastIndexOf("/") + 1,
    firstPartOfNewPath = originalPath.slice(0, afterLastSlashIndex), // '#/a/b/'
    lastPartOfNewPath = originalPath.slice(afterLastSlashIndex, originalPath.length); // 'c'

  return `${firstPartOfNewPath}${pathPrefix}${lastPartOfNewPath}`;
}

function updateComponentPaths(importableDoc: IImport, componentPathPrefix: string) {

  if (!componentPathPrefix) return;

  let allReferencingObjects = getAllReferencingObjectsInObject(importableDoc);
  allReferencingObjects
    .forEach(referencingObject => {
      let originalPath = referencingObject.$ref,
        originalPathValid = originalPath.substr(1),
        newPath = createNewPath(referencingObject.$ref, componentPathPrefix),
        newPathValid = newPath.substr(1);

      console.log(`Converting component path reference from '${originalPath}' to '${newPath}' ...`);

      // set path to newpath
      referencingObject.$ref = newPath;

      // reassign component to diff path (component may have been reassigned already because multiple objects reference it)
      if (pointer.has(importableDoc, originalPathValid)) {
        let referencedObject = pointer.get(importableDoc, originalPathValid);
        pointer.remove(importableDoc, originalPathValid);
        pointer.set(importableDoc, newPathValid, referencedObject);
      }
    });
}

async function getObjectToImportAsync(docUrl: string, docConfiguration: Configuration.IDocConfig): Promise<IImport> {

  console.log(`Fetching json for ${docUrl} ...`);
  let originalDocJson = await getURLJsonAsync(docUrl) as (OpenAPIV2.Document | OpenAPIV3.Document);

  console.log(`Checking and/or converting doc at ${docUrl} to OpenAPI V3...`);
  let openapiv3Doc = await asOpenAPIV3Async(originalDocJson);

  console.log(`Creating paths to import from ${docUrl} ...`);
  let pathsToImport = getPathsToImport(openapiv3Doc.paths, docConfiguration.paths);

  console.log(`(Recursively) Creating components to import from ${docUrl} ...`);
  let componentsToImport = getComponentsToImport(openapiv3Doc, Object.keys(docConfiguration.paths));

  let importedDoc: IImport = {
    paths: pathsToImport,
    components: componentsToImport
  };

  console.log(`Updating components imported from ${docUrl} with path prefix, ${docConfiguration.componentPathPrefix} ...`);
  updateComponentPaths(importedDoc, docConfiguration.componentPathPrefix);

  return importedDoc;
}

export async function createDocAsync(config: Configuration.IGenOpenAPIV3Config): Promise<string> {
  let documentObjectsToImport =
    await Promise.all(
      Object
        .keys(config.docs)
        .map(x => getObjectToImportAsync(x, config.docs[x])));

  console.log(`Combining ${documentObjectsToImport.length} doc(s) with template at ${config.output.template} ...`);
  let
    templateJson = getJsonByFilePath(config.output.template) as OpenAPIV3.Document,
    combinedObjectToImport = documentObjectsToImport.reduce(deepExtend, {}) as IImport;

  let completeSwaggerDoc = deepExtend(templateJson, combinedObjectToImport);

  console.log(`Writing generated doc at ${config.output.destination} ...`);
  writeJsonToFile(completeSwaggerDoc, config.output.destination);

  console.log(`**************************************************`);
  console.log(`Completed generating file at ${config.output.destination}. Please verify destination file is a valid OpenAPI V3 document at (https://editor.swagger.io/).`);

  return config.output.destination;
}

interface IImport {
  paths: OpenAPIV3.PathObject,
  components: OpenAPIV3.ComponentsObject;
}

interface IReferencedComponent {
  path: string,
  obj: object
}