"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const request_promise_1 = __importDefault(require("request-promise"));
const swagger2openapi_1 = __importDefault(require("swagger2openapi"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const json_pointer_1 = __importDefault(require("json-pointer"));
const V2_REGEX = /2.*/;
const V3_REGEX = /3.*/;
function getURLJsonAsync(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_promise_1.default
            .get(url)
            .then(JSON.parse);
    });
}
function getJsonByFilePath(filePath) {
    return JSON.parse(fs_1.default.readFileSync(filePath, { encoding: 'utf8' }));
}
function asOpenAPIV3Async(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        let v2Doc = doc, v3Doc = doc, isV2Doc = v2Doc.swagger && V2_REGEX.test(v2Doc.swagger), isV3Doc = v3Doc.openapi && V3_REGEX.test(v3Doc.openapi);
        if (isV2Doc) {
            let res = yield swagger2openapi_1.default.convertObj(v2Doc, {});
            return res.openapi;
        }
        else if (isV3Doc) {
            return v3Doc;
        }
        else {
            throw Error('Document not recognized as Swagger 2.x nor OpenAPI 3.x.');
        }
    });
}
function writeJsonToFile(json, filePath) {
    let parsedPath = path_1.default.parse(filePath);
    if (!fs_1.default.existsSync(parsedPath.dir)) {
        fs_1.default.mkdirSync(parsedPath.dir);
    }
    fs_1.default.writeFileSync(filePath, JSON.stringify(json, null, 2));
}
function getPathsToImport(originalDocPaths, pathsConfiguration) {
    let docPaths = JSON.parse(JSON.stringify(originalDocPaths)); // make copy, so the original isn't altered
    // If no configuration is present, keep all original paths
    if (pathsConfiguration == null)
        return;
    if (Object.keys(pathsConfiguration).length <= 0)
        return;
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
            if (docPath.get)
                docPath.get.tags = newTags;
            if (docPath.put)
                docPath.put.tags = newTags;
            if (docPath.post)
                docPath.post.tags = newTags;
            if (docPath.delete)
                docPath.delete.tags = newTags;
            if (docPath.options)
                docPath.options.tags = newTags;
            if (docPath.head)
                docPath.head.tags = newTags;
            if (docPath.patch)
                docPath.patch.tags = newTags;
            if (docPath.trace)
                docPath.trace.tags = newTags;
        }
        // Set new path names
        if (pathsConfiguration[path].newName) {
            docPaths[pathsConfiguration[path].newName] = docPaths[path];
            delete docPaths[path];
        }
        // Run configured path hooks
        let config = pathsConfiguration[path];
        let docPath = docPaths[config.newName];
        if (config.onPathComplete)
            config.onPathComplete(docPath);
    }
    return docPaths;
}
function getAllReferencingObjectsInObject(objectToSearch) {
    // deep object search for properties named '$ref'
    let results = [];
    if (objectToSearch instanceof Array) {
        let referencedComponents = objectToSearch
            .map(getAllReferencingObjectsInObject);
        results = results.concat(...referencedComponents);
    }
    else {
        for (let prop in objectToSearch) {
            let propValue = objectToSearch[prop];
            if (prop == '$ref') {
                results.push(objectToSearch);
            }
            else if (propValue instanceof Object || propValue instanceof Array) {
                results = results.concat(getAllReferencingObjectsInObject(propValue));
            }
        }
    }
    return results;
}
function getAllReferencedComponentsInObject(rootObject, objectToSearch) {
    let referencingObjects = getAllReferencingObjectsInObject(objectToSearch);
    // Distinct referencing objects
    let distinctReferencingObjects = [];
    let map = new Map();
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
            obj: json_pointer_1.default.get(rootObject, strictPath)
        };
    });
}
function getComponentsToImport(doc, paths) {
    let groupsOfReferencedComponents = paths
        .map(x => doc.paths[x])
        .map(x => getAllReferencedComponentsInObject(doc, x));
    let referencedComponents = []
        .concat(...groupsOfReferencedComponents);
    // We must go deeper... Recursive search through results (Find components referenced by referenced components)
    let recursiveResults = referencedComponents;
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
    let newDoc = {};
    referencedComponents
        .forEach(x => {
        json_pointer_1.default.set(newDoc, x.path, x.obj);
    });
    return newDoc.components;
}
function createNewPath(originalPath, pathPrefix) {
    let afterLastSlashIndex = originalPath.lastIndexOf("/") + 1, firstPartOfNewPath = originalPath.slice(0, afterLastSlashIndex), // '#/a/b/'
    lastPartOfNewPath = originalPath.slice(afterLastSlashIndex, originalPath.length); // 'c'
    return `${firstPartOfNewPath}${pathPrefix}${lastPartOfNewPath}`;
}
function updateComponentPaths(importableDoc, componentPathPrefix) {
    if (!componentPathPrefix)
        return;
    let allReferencingObjects = getAllReferencingObjectsInObject(importableDoc);
    allReferencingObjects
        .forEach(referencingObject => {
        let originalPath = referencingObject.$ref, originalPathValid = originalPath.substr(1), newPath = createNewPath(referencingObject.$ref, componentPathPrefix), newPathValid = newPath.substr(1);
        console.log(`Converting component path reference from '${originalPath}' to '${newPath}' ...`);
        // set path to newpath
        referencingObject.$ref = newPath;
        // reassign component to diff path (component may have been reassigned already because multiple objects reference it)
        if (json_pointer_1.default.has(importableDoc, originalPathValid)) {
            let referencedObject = json_pointer_1.default.get(importableDoc, originalPathValid);
            json_pointer_1.default.remove(importableDoc, originalPathValid);
            json_pointer_1.default.set(importableDoc, newPathValid, referencedObject);
        }
    });
}
function getObjectToImportAsync(docUrl, docConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching json for ${docUrl} ...`);
        let originalDocJson = yield getURLJsonAsync(docUrl);
        console.log(`Checking and/or converting doc at ${docUrl} to OpenAPI V3...`);
        let openapiv3Doc = yield asOpenAPIV3Async(originalDocJson);
        console.log(`Creating paths to import from ${docUrl} ...`);
        let pathsToImport = getPathsToImport(openapiv3Doc.paths, docConfiguration.paths);
        console.log(`(Recursively) Creating components to import from ${docUrl} ...`);
        let componentsToImport = getComponentsToImport(openapiv3Doc, Object.keys(docConfiguration.paths));
        let importedDoc = {
            paths: pathsToImport,
            components: componentsToImport
        };
        console.log(`Updating components imported from ${docUrl} with path prefix, ${docConfiguration.componentPathPrefix} ...`);
        updateComponentPaths(importedDoc, docConfiguration.componentPathPrefix);
        return importedDoc;
    });
}
function createDocAsync(config) {
    return __awaiter(this, void 0, void 0, function* () {
        let documentObjectsToImport = yield Promise.all(Object
            .keys(config.docs)
            .map(x => getObjectToImportAsync(x, config.docs[x])));
        console.log(`Combining ${documentObjectsToImport.length} doc(s) with template at ${config.output.template} ...`);
        let templateJson = getJsonByFilePath(config.output.template), combinedObjectToImport = documentObjectsToImport.reduce(deep_extend_1.default, {});
        let completeSwaggerDoc = deep_extend_1.default(templateJson, combinedObjectToImport);
        console.log(`Writing generated doc at ${config.output.destination} ...`);
        writeJsonToFile(completeSwaggerDoc, config.output.destination);
        console.log(`**************************************************`);
        console.log(`Completed generating file at ${config.output.destination}. Please verify destination file is a valid OpenAPI V3 document at (https://editor.swagger.io/).`);
        return config.output.destination;
    });
}
exports.createDocAsync = createDocAsync;
//# sourceMappingURL=index.js.map