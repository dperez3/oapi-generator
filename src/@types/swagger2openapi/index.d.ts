import { OpenAPIV3, OpenAPIV2 } from 'openapi-types';

// export class S2OError {
//   static captureStackTrace(p0: any, p1: any): any;
//   static stackTraceLimit: number;
//   constructor(message: any);
//   name: any;
// }

type ConvertObjResult = {
  original: OpenAPIV2.Document;
  text: string;
  openapi: OpenAPIV3.Document;
};

export function convert(swagger: any, options: any, callback: any): any;
export function convertFile(filename: any, options: any, callback: any): any;
export function convertObj(swagger: any, options: any, callback: any): any;
export function convertObj(
  swagger: any,
  options: any
): Promise<ConvertObjResult>;
export function convertStr(str: any, options: any, callback: any): any;
export function convertStream(readable: any, options: any, callback: any): any;
export function convertUrl(url: any, options: any, callback: any): any;
export const targetVersion: string;
