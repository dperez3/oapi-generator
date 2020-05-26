import { Configuration } from './configuration';
import ui from './ui';
import {
  getOApiDocuments,
  validateDocuments,
  convertToV3,
  identifyVersion,
  saveOApiDocument,
  validateDocument,
  Types,
} from './docUtility';
import { OpenAPIV3, OpenAPIV2 } from 'openapi-types';
import parseImport from './importParser';
import deepExtend from 'deep-extend';

export default async function generate(
  configs: Configuration.IGenOpenAPIV3Config[]
) {
  const errors = [];

  // Per document to generate...
  for (const config of configs) {
    ui.writeInfoLine(`Starting generation for '${config.destination}'...`);
    try {
      // Phase 1: Pull down all source docs
      // Fail immediately, if something doesn't work
      const sourceDocuments = await getSourceDocuments(config);

      // Phase 2: validate all source docs
      // Fail immediately, if something is invalid
      await validateSourceDocuments(config, sourceDocuments);

      // Phase 3: Convert V2 docs to V3
      // Fail immediately, if not successful
      const sourceV3Documents = await convertToV3Documents(
        config,
        sourceDocuments
      );

      // Phase 4: Combine docs
      const generatedDoc = await generateDoc(config, sourceV3Documents);

      // Phase 5: Run any configured onDocComplete functions
      await runOnDocComplete(config, generatedDoc);

      // Phase 6: Validate final doc
      await validateGeneratedDoc(config, generatedDoc);

      // Phase 7: Save generated doc
      await saveGeneratedDoc(generatedDoc, config);
    } catch (error) {
      ui.stopProgress();
      ui.writeError(error);
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw errors[0];
  }
}

async function getSourceDocuments(
  config: Configuration.IGenOpenAPIV3Config
): Promise<Types.DocumentInfo<Types.OpenAPIDocument>[]> {
  // Phase 1: Pull down all source docs
  // Fail immediately, if something doesn't work
  ui.startProgress(`Getting source documents for '${config.destination}'...`);
  const docResults = await getOApiDocuments(...Object.keys(config.docs));
  ui.stopProgress();

  return docResults;
}

async function validateSourceDocuments(
  config: Configuration.IGenOpenAPIV3Config,
  docResults: Types.DocumentInfo<Types.OpenAPIDocument>[]
): Promise<void> {
  // Phase 2: validate all source docs
  // Fail immediately, if something is invalid
  ui.startProgress(
    `Validating source documents for '${config.destination}'...`
  );
  const validationResults = await validateDocuments(
    ...docResults.map(x => {
      return {
        src: x.src,
        doc: x.doc,
      };
    })
  );
  await reportValidationResults(...validationResults);
  ui.stopProgress();
  if (config.throwSrcValidation) {
    await throwIfValidationErrors(...validationResults.map(x => x.result));
  }
}

async function convertToV3Documents(
  config: Configuration.IGenOpenAPIV3Config,
  sourceDocuments: Types.DocumentInfo<Types.OpenAPIDocument>[]
): Promise<Types.DocumentInfo<Types.OpenAPIV3Document>[]> {
  // Phase 3: Convert V2 docs to V3
  // Fail immediately, if not successful
  // TODO: This is bad, clean it up.
  const v2Documents = sourceDocuments.filter(
    x => identifyVersion(x) === Types.OpenAPIVersion.V2
  );
  if (v2Documents.length > 0) {
    ui.startProgress(
      `Converting V2 source document(s) to V3 for '${config.destination}'...`
    );
    const convertedDocuments = await Promise.all(
      v2Documents.map(async v2Doc => {
        ui.writeInfoLine(`Converting '${v2Doc.src}'...`);
        return {
          path: v2Doc.src,
          doc: await convertToV3(v2Doc.doc as OpenAPIV2.Document),
        };
      })
    );

    // reassign doc property of v2 objects to matching v3 doc
    convertedDocuments.forEach(v3Doc => {
      const oldV2Doc = sourceDocuments.find(
        srcDoc => srcDoc.src === v3Doc.path
      ) as Types.DocumentInfo<Types.OpenAPIV2Document>;
      oldV2Doc.doc = v3Doc.doc as any;
    });

    ui.stopProgress();
  }

  // Sanity check
  if (
    !sourceDocuments.every(x => identifyVersion(x) === Types.OpenAPIVersion.V3)
  ) {
    throw new Error('Could not convert all documents to V3.');
  }

  return sourceDocuments as Types.DocumentInfo<Types.OpenAPIV3Document>[];
}

async function generateDoc(
  config: Configuration.IGenOpenAPIV3Config,
  sourceDocs: Types.DocumentInfo<Types.OpenAPIV3Document>[]
): Promise<OpenAPIV3.Document> {
  // Phase 4: Combine docs
  const importables = await Promise.all(
    sourceDocs.map(async doc => {
      return await parseImport(doc.doc, config.docs[doc.src]);
    })
  );

  let combinedObjectToImport = importables.reduce(deepExtend, {});

  return combinedObjectToImport as OpenAPIV3.Document;
}

async function runOnDocComplete(
  config: Configuration.IGenOpenAPIV3Config,
  generatedDoc: OpenAPIV3.Document
): Promise<void> {
  // Phase 5: Run any configured onDocComplete functions
  if (config.onGeneratedDoc !== undefined) {
    ui.startProgress(
      `Running onGeneratedDoc hook, ${config.onGeneratedDoc.name}...`
    );
    await config.onGeneratedDoc(generatedDoc);
    ui.stopProgress();
  } else {
    ui.writeInfoLine('No onGeneratedDoc hook found.');
  }
}

async function validateGeneratedDoc(
  config: Configuration.IGenOpenAPIV3Config,
  generatedDoc: OpenAPIV3.Document
): Promise<void> {
  // Phase 6: Validate final doc
  ui.startProgress(
    `Validating generated document for '${config.destination}'...`
  );
  const validationResult = await validateDocument(generatedDoc);
  await reportValidationResults({
    docSrc: config.destination,
    result: validationResult,
  });
  ui.stopProgress();
  if (config.throwDestValidation) {
    await throwIfValidationErrors(validationResult);
  }
}

async function saveGeneratedDoc(
  generatedDoc: OpenAPIV3.Document,
  config: Configuration.IGenOpenAPIV3Config
): Promise<void> {
  ui.startProgress(`Saving generated document to '${config.destination}'...`);
  await saveOApiDocument(generatedDoc, config.destination);
  ui.stopProgress();
}

///////////////////////////////

async function reportValidationResults(
  ...validationResults: Types.ValidationResult[]
) {
  validationResults.forEach(res => {
    if (res.result.errors.length > 0) {
      ui.writeError(`Found error(s) for '${res.docSrc}'...` as Object);
      res.result.errors.forEach(err => {
        ui.writeError(err);
      });
    } else if (res.result.warnings.length > 0) {
      ui.writeWarnLine(`Found warnings(s) for '${res.docSrc}'...`);
      res.result.warnings.forEach(warning => {
        ui.writeWarnLine(`'${warning.message}' at '${warning.path}'.`);
      });
    }
  });
}

async function throwIfValidationErrors(
  ...validationResults: Types.ValidatorResult[]
) {
  const validationErrs = validationResults.flatMap(x => x.errors);
  if (validationErrs.length > 0) {
    throw validationErrs;
  }
}
