export class S2OError {
  static captureStackTrace(p0: any, p1: any): any;
  static stackTraceLimit: number;
  constructor(message: any);
  name: any;
}
export function convert(swagger: any, options: any, callback: any): any;
export function convertFile(filename: any, options: any, callback: any): any;
export function convertObj(swagger: any, options: any, callback: any): any;
export function convertObj(swagger: any, options: any): Promise<any>;
export function convertStr(str: any, options: any, callback: any): any;
export function convertStream(readable: any, options: any, callback: any): any;
export function convertUrl(url: any, options: any, callback: any): any;
export const targetVersion: string;
