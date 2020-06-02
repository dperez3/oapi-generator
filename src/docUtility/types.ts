import { OpenAPIV3, OpenAPIV2 } from 'openapi-types';

export type OpenAPIV2Document = OpenAPIV2.Document;
export type OpenAPIV3Document = OpenAPIV3.Document;
export type OpenAPIDocument = OpenAPIV2Document | OpenAPIV3Document;

export type DocumentInfo<T extends OpenAPIDocument> = {
  src: string;
  doc: T;
};

export enum OpenAPIVersion {
  V2,
  V3,
}

export type ValidationResult = {
  docSrc: string;
  result: ValidatorResult;
};

export type ValidatorResultItem = {
  message: string;
};

export type ValidatorResult = {
  errors: ValidatorResultItem[];
  warnings: ValidatorResultItem[];
};

export type ValidationError = {
  stack: string;
  message: string;
  toJSON: Function;
  name: string;
  toString: () => string;
};
