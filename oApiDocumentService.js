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
const url_1 = require("url");
const fs_1 = require("fs");
const request_promise_1 = __importDefault(require("request-promise"));
const oas_validator_1 = __importDefault(require("oas-validator"));
function tryGetUrl(path) {
    try {
        return new url_1.URL(path);
    }
    catch (err) {
        return null;
    }
}
function getRemoteJson(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return request_promise_1.default.get(url.toString()).then(JSON.parse);
    });
}
function getLocalJson(path) {
    return JSON.parse(fs_1.readFileSync(path, { encoding: "utf8" }));
}
function getJson(urlOrFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = tryGetUrl(urlOrFilePath);
        if (url !== null)
            return yield getRemoteJson(url);
        if (fs_1.existsSync(urlOrFilePath))
            return getLocalJson(urlOrFilePath);
        throw new Error(`"${urlOrFilePath}" is neither a valid url not a valid local file path.`);
    });
}
function getOApiDocument(urlOrFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getJson(urlOrFilePath);
    });
}
exports.getOApiDocument = getOApiDocument;
function isValidOApiDocument(oApiDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oas_validator_1.default.validate(oApiDocument, {});
    });
}
exports.isValidOApiDocument = isValidOApiDocument;
function convertToV3(openApiV2Document) {
    return __awaiter(this, void 0, void 0, function* () {
        throw new Error("Not Implemented");
    });
}
exports.convertToV3 = convertToV3;
function saveOApiDocument(document, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        throw new Error("Not Implemented");
    });
}
exports.saveOApiDocument = saveOApiDocument;
//# sourceMappingURL=oApiDocumentService.js.map