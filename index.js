#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const oApiDocumentService_1 = require("./oApiDocumentService");
const swagger2openapi_1 = __importDefault(require("swagger2openapi"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const json_pointer_1 = __importDefault(require("json-pointer"));
const console_ui_1 = __importDefault(require("console-ui"));
const V2_REGEX = /2.*/;
const V3_REGEX = /3.*/;
const FailIfInvalidImports = false;
const ui = new console_ui_1.default({
    inputStream: process.stdin,
    outputStream: process.stdout,
    errorStream: process.stderr,
    writeLevel: "WARNING" //'DEBUG' | 'INFO' | 'WARNING' | 'ERROR',
});
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
            throw Error("Document not recognized as Swagger 2.x nor OpenAPI 3.x.");
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
        let referencedComponents = objectToSearch.map(getAllReferencingObjectsInObject);
        results = results.concat(...referencedComponents);
    }
    else {
        for (let prop in objectToSearch) {
            let propValue = objectToSearch[prop];
            if (prop == "$ref") {
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
    return distinctReferencingObjects.map(x => {
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
    let referencedComponents = [].concat(...groupsOfReferencedComponents);
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
    referencedComponents.forEach(x => {
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
    allReferencingObjects.forEach(referencingObject => {
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
function transformToImportable(sourceOApiDocument, docConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching json for ${docUrl} ...`);
        let originalDocJson = (yield importJson(docUrl));
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
function getSourceOApiDocuments(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(paths.map((path) => __awaiter(this, void 0, void 0, function* () {
            return {
                sourcePath: path,
                oApiDocument: yield oApiDocumentService_1.getOApiDocument(path)
            };
        })));
    });
}
function validateOApiDocuments(oApiSourceDocuments) {
    return __awaiter(this, void 0, void 0, function* () {
        let validatedDocuments = yield Promise.all(oApiSourceDocuments.map((x) => __awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({}, x), { isValid: yield oApiDocumentService_1.isValidOApiDocument(x.oApiDocument) });
        })));
        let invalidDocuments = validatedDocuments.filter(x => x.isValid === false);
        if (invalidDocuments.length > 0) {
            let invalidSources = invalidDocuments
                .map(x => `"${x.sourcePath}"`)
                .join(", ");
            let message = `Imported documents did not have valid schemas => ${invalidSources}`;
            ui.writeWarnLine(message);
            if (FailIfInvalidImports) {
                throw new Error(message);
            }
        }
    });
}
function generateDocAsync(config) {
    return __awaiter(this, void 0, void 0, function* () {
        // Step 1: Import all dependent documents. Fail immediately if one is not found.
        let oapiDocumentsToImport = yield getSourceOApiDocuments(Object.keys(config.docs));
        // Step 2: Validate imported OpenAPI document schemas. Log or fail when invalid schema is found. (new config value?).
        yield validateOApiDocuments(oapiDocumentsToImport);
        // Step 3: Setup plan. Report plan.
        //    - V2 to V3 conversions
        // Step 4: Execute plan. Iterate through each document 1 by 1. Report all things...
        //    - V2 to V3 conversions
        //    - Types being imported
        let importationContexts = oapiDocumentsToImport.map(x => {
            return {
                config: config.docs[x.sourcePath],
                oApiDocument: x.oApiDocument
            };
        });
        let finalImportables = yield Promise.all(oapiDocumentsToImport.map(importedDoc => transformToImportable(importedDoc, config)));
        let documentObjectsToImport = yield Promise.all(Object.keys(config.docs).map(doc => getObjectToImportAsync(doc, config.docs[doc])));
        console.log(`Combining ${documentObjectsToImport.length} doc(s) with template at ${config.output.template} ...`);
        let templateJson = (yield importJson(config.output.template));
        let combinedObjectToImport = documentObjectsToImport.reduce(deep_extend_1.default, {});
        let completeSwaggerDoc = deep_extend_1.default(templateJson, combinedObjectToImport);
        console.log(`Writing generated doc at ${config.output.destination} ...`);
        writeJsonToFile(completeSwaggerDoc, config.output.destination);
        console.log(`**************************************************`);
        console.log(`Completed generating file at ${config.output.destination}. Please verify destination file is a valid OpenAPI V3 document at (https://editor.swagger.io/).`);
        return config.output.destination;
    });
}
exports.generateDocAsync = generateDocAsync;
//# sourceMappingURL=index.js.map