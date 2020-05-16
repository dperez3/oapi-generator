#!/usr/bin/env node

import { OpenAPIV3 } from "openapi-types";

export namespace Configuration {
  /**
   * Specify configuration for generating many documents.
   */
  export interface IManyGenOpenAPIV3Configs {
    /**
     * Collection of configurations to generate many documents with.
     */
    genConfigs: IGenOpenAPIV3Config[];
  }

  /**
   * Specify configuration for a single document.
   */
  export interface IGenOpenAPIV3Config {
    /**
     * Specifies what Swagger or OpenAPI docs to import.
     *
     * **Example**
     *
     * ```json
     * {
     *  "docs": {
     *    "https://petstore.swagger.io/v2/swagger.json": { // import configuration },
     *    "www.other.com/swagger.json": { // import configuration },
     *  }
     * }
     * ```
     */
    docs: IDocsConfig;
    /**
     * Specifies what intitial template to start with and where to output the generated document.
     */
    output: IOutputConfig;
  }

  /**
   * Specify Swagger or OpenAPI docs to import.
   */
  export interface IDocsConfig {
    /**
     * URL of Swagger or OpenAPI doc to import.
     */
    [docUrl: string]: IDocConfig;
  }

  /**
   * Specify configuration for how a document should be imported.
   */
  export interface IDocConfig {
    /**
     * Specific paths to import.
     *
     * **Example**
     *
     * ```json
     * {
     *  "paths": {
     *    "v1/ThingA": { //import configuration },
     *    "v1/ThingB": { //import configuration }
     *  }
     * }
     * ```
     */
    paths: IPathsConfig;
    /**
     * The prefix to append to the names of Components that this path depends on.
     * Use to avoid name collisions between Components sharing the same name across many imported docs.
     */
    componentPathPrefix: string;
  }

  /**
   * Specify configuration for what paths to import.
   */
  export interface IPathsConfig {
    /**
     * Path to import.
     */
    [path: string]: IPathConfig;
  }

  /**
   * Specify configuration for how a path is imported.
   */
  export interface IPathConfig {
    /**
     * The new path name this path should be imported with.
     */
    newName: string;
    /**
     * New tags to use.
     */
    tags: string[];
    /**
     * Custom modification of the path object before it is imported.
     */
    onPathComplete?: (path: OpenAPIV3.PathItemObject) => void;
  }

  /**
   * Specify intitial template to start with and where to output the generated document.
   */
  export interface IOutputConfig {
    /**
     * Path of static template to start with before external documents are imported.
     * Use for custom proxies and any other changes that can't be configured.
     */
    template: string;
    /**
     * Path of the document to be generated.
     */
    destination: string;
  }
}
