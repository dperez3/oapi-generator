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
function importJson(urlOrPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = tryGetUrl(urlOrPath);
        if (url !== null)
            return yield getRemoteJson(url);
        if (fs_1.existsSync(urlOrPath))
            return getLocalJson(urlOrPath);
        throw new Error(`"${urlOrPath}" is neither a valid url not a valid local file path.`);
    });
}
exports.default = importJson;
//# sourceMappingURL=importer.js.map