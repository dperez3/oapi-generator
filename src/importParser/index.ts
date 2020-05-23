import { OpenAPIV3 } from 'openapi-types';
import { Configuration } from 'configuration';
import pointer from 'json-pointer';
import deepExtend from 'deep-extend';

export default async function parseImport(
  openapiv3Doc: OpenAPIV3.Document,
  docConfiguration: Configuration.IDocConfig
): Promise<IImport> {
  const pathsToImport = getPathsToImport(
    openapiv3Doc.paths,
    docConfiguration.paths || null
  );

  const componentsToImport = getComponentsToImport(
    openapiv3Doc,
    Object.keys(pathsToImport)
  );

  const importedDoc: IImport = {
    paths: pathsToImport,
    components: componentsToImport,
  };

  updateComponentPaths(importedDoc, docConfiguration.componentPathPrefix);

  const originalCopy = JSON.parse(
    JSON.stringify(openapiv3Doc)
  ) as OpenAPIV3.Document; // make copy, so the original isn't altered

  deepExtend(originalCopy, importedDoc);

  return originalCopy;
}

function getPathsToImport(
  originalDocPaths: OpenAPIV3.PathObject,
  pathsConfiguration: Configuration.IPathsConfig | null
): OpenAPIV3.PathObject {
  let docPaths = JSON.parse(
    JSON.stringify(originalDocPaths)
  ) as OpenAPIV3.PathObject; // make copy, so the original isn't altered

  // If no configuration is present, keep all original paths
  if (pathsConfiguration == null) return originalDocPaths;
  if (Object.keys(pathsConfiguration).length <= 0) return originalDocPaths;

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

      if (docPath.get) docPath.get.tags = newTags;
      if (docPath.put) docPath.put.tags = newTags;
      if (docPath.post) docPath.post.tags = newTags;
      if (docPath.delete) docPath.delete.tags = newTags;
      if (docPath.options) docPath.options.tags = newTags;
      if (docPath.head) docPath.head.tags = newTags;
      if (docPath.patch) docPath.patch.tags = newTags;
      if (docPath.trace) docPath.trace.tags = newTags;
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

function getComponentsToImport(
  doc: OpenAPIV3.Document,
  paths: string[]
): OpenAPIV3.ComponentsObject {
  let groupsOfReferencedComponents = paths
    .map(x => doc.paths[x])
    .map(x => getAllReferencedComponentsInObject(doc, x));

  let referencedComponents = ([] as IReferencedComponent[]).concat(
    ...groupsOfReferencedComponents
  );

  // We must go deeper... Recursive search through results (Find components referenced by referenced components)
  let recursiveResults: IReferencedComponent[] = referencedComponents;
  do {
    let recursiveRefGroup = recursiveResults
      .map(x => {
        return getAllReferencedComponentsInObject(doc, x.obj);
      })
      .filter(x => x.length > 0);

    // next level
    recursiveResults = recursiveRefGroup.flat();

    referencedComponents = referencedComponents.concat(...recursiveResults);
  } while (recursiveResults.length > 0);

  let newDoc = {} as OpenAPIV3.Document;
  referencedComponents.forEach(x => {
    pointer.set(newDoc, x.path, x.obj);
  });

  return newDoc.components || {};
}

function updateComponentPaths(
  importableDoc: IImport,
  componentPathPrefix: string
) {
  if (!componentPathPrefix) return;

  let allReferencingObjects = getAllReferencingObjectsInObject(importableDoc);
  allReferencingObjects.forEach(referencingObject => {
    let originalPath = referencingObject.$ref,
      originalPathValid = originalPath.substr(1),
      newPath = createNewPath(referencingObject.$ref, componentPathPrefix),
      newPathValid = newPath.substr(1);

    console.log(
      `Converting component path reference from '${originalPath}' to '${newPath}' ...`
    );

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

function getAllReferencedComponentsInObject(
  rootObject: object,
  objectToSearch: any
): IReferencedComponent[] {
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

  return distinctReferencingObjects.map(x => {
    let strictPath = x.substr(1);
    return {
      path: strictPath,
      obj: pointer.get(rootObject, strictPath),
    } as IReferencedComponent;
  });
}

function getAllReferencingObjectsInObject(
  objectToSearch: any
): { $ref: string }[] {
  // deep object search for properties named '$ref'
  let results: { $ref: string }[] = [];

  if (objectToSearch instanceof Array) {
    let referencedComponents = (objectToSearch as Array<any>).map(
      getAllReferencingObjectsInObject
    );

    results = results.concat(...referencedComponents);
  } else {
    for (let prop in objectToSearch) {
      let propValue = objectToSearch[prop];

      if (prop === '$ref') {
        results.push(objectToSearch);
      } else if (propValue instanceof Object || propValue instanceof Array) {
        results = results.concat(getAllReferencingObjectsInObject(propValue));
      }
    }
  }

  return results;
}

function createNewPath(originalPath: string, pathPrefix: string): string {
  let afterLastSlashIndex = originalPath.lastIndexOf('/') + 1,
    firstPartOfNewPath = originalPath.slice(0, afterLastSlashIndex), // '#/a/b/'
    lastPartOfNewPath = originalPath.slice(
      afterLastSlashIndex,
      originalPath.length
    ); // 'c'

  return `${firstPartOfNewPath}${pathPrefix}${lastPartOfNewPath}`;
}

export type IImport = {} | OpenAPIV3.Document;

interface IReferencedComponent {
  path: string;
  obj: object;
}
