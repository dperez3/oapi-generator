import parseImport from '../src/importParser';
import { Configuration } from '../src/configuration';
import { dataDocs } from './utility';
import './extensions';

jest.mock('../src/ui', () => {
  return {
    __esModule: true,
    default: require('./utility').mockUI,
  };
});

describe('importParser', () => {
  it('can return equal copy with prefixed component paths', async () => {
    const config: Configuration.IDocConfig = {
      componentPathPrefix: 'TestPrefix_',
    };

    expect(await parseImport(dataDocs.localV3Doc(), config)).toEqual(
      dataDocs.localV3Doc()
    );
    expect(await parseImport(dataDocs.localV3PetstoreDoc(), config)).toEqual({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Swagger Petstore',
        description:
          'A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification',
        termsOfService: 'http://swagger.io/terms/',
        contact: {
          name: 'Swagger API Team',
          email: 'apiteam@swagger.io',
          url: 'http://swagger.io',
        },
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
        },
      },
      servers: [
        {
          url: 'http://petstore.swagger.io/api',
        },
      ],
      paths: {
        '/pets': {
          get: {
            description:
              'Returns all pets from the system that the user has access to\nNam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.\nSed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.\n',
            operationId: 'findPets',
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'tags to filter by',
                required: false,
                style: 'form',
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
              {
                name: 'limit',
                in: 'query',
                description: 'maximum number of results to return',
                required: false,
                schema: {
                  type: 'integer',
                  format: 'int32',
                },
              },
            ],
            responses: {
              '200': {
                description: 'pet response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/TestPrefix_Pet',
                      },
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Error',
                    },
                  },
                },
              },
            },
          },
          post: {
            description:
              'Creates a new pet in the store. Duplicates are allowed',
            operationId: 'addPet',
            requestBody: {
              description: 'Pet to add to the store',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TestPrefix_NewPet',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'pet response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Pet',
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Error',
                    },
                  },
                },
              },
            },
          },
        },
        '/pets/{id}': {
          get: {
            description:
              'Returns a user based on a single ID, if the user does not have access to the pet',
            operationId: 'find pet by id',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: 'ID of pet to fetch',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                },
              },
            ],
            responses: {
              '200': {
                description: 'pet response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Pet',
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Error',
                    },
                  },
                },
              },
            },
          },
          delete: {
            description: 'deletes a single pet based on the ID supplied',
            operationId: 'deletePet',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: 'ID of pet to delete',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                },
              },
            ],
            responses: {
              '204': {
                description: 'pet deleted',
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Error',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          TestPrefix_Pet: {
            allOf: [
              {
                $ref: '#/components/schemas/TestPrefix_NewPet',
              },
              {
                type: 'object',
                required: ['id'],
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int64',
                  },
                },
              },
            ],
          },
          TestPrefix_NewPet: {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
            },
          },
          TestPrefix_Error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'integer',
                format: 'int32',
              },
              message: {
                type: 'string',
              },
            },
          },
        },
      },
    });
    expect(await parseImport(dataDocs.localV3UsptoDoc(), config)).toEqual({
      openapi: '3.0.1',
      servers: [
        {
          url: '{scheme}://developer.uspto.gov/ds-api',
          variables: {
            scheme: {
              description: 'The Data Set API is accessible via https and http',
              enum: ['https', 'http'],
              default: 'https',
            },
          },
        },
      ],
      info: {
        description:
          'The Data Set API (DSAPI) allows the public users to discover and search USPTO exported data sets. This is a generic API that allows USPTO users to make any CSV based data files searchable through API. With the help of GET call, it returns the list of data fields that are searchable. With the help of POST call, data can be fetched based on the filters on the field names. Please note that POST call is used to search the actual data. The reason for the POST call is that it allows users to specify any complex search criteria without worry about the GET size limitations as well as encoding of the input parameters.',
        version: '1.0.0',
        title: 'USPTO Data Set API',
        contact: {
          name: 'Open Data Portal',
          url: 'https://developer.uspto.gov',
          email: 'developer@uspto.gov',
        },
      },
      tags: [
        {
          name: 'metadata',
          description: 'Find out about the data sets',
        },
        {
          name: 'search',
          description: 'Search a data set',
        },
      ],
      paths: {
        '/': {
          get: {
            tags: ['metadata'],
            operationId: 'list-data-sets',
            summary: 'List available data sets',
            responses: {
              '200': {
                description: 'Returns a list of data sets',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_dataSetList',
                    },
                    example: {
                      total: 2,
                      apis: [
                        {
                          apiKey: 'oa_citations',
                          apiVersionNumber: 'v1',
                          apiUrl:
                            'https://developer.uspto.gov/ds-api/oa_citations/v1/fields',
                          apiDocumentationUrl:
                            'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/oa_citations.json',
                        },
                        {
                          apiKey: 'cancer_moonshot',
                          apiVersionNumber: 'v1',
                          apiUrl:
                            'https://developer.uspto.gov/ds-api/cancer_moonshot/v1/fields',
                          apiDocumentationUrl:
                            'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/cancer_moonshot.json',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        '/{dataset}/{version}/fields': {
          get: {
            tags: ['metadata'],
            summary:
              'Provides the general information about the API and the list of fields that can be used to query the dataset.',
            description:
              "This GET API returns the list of all the searchable field names that are in the oa_citations. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the syntax options shown below.",
            operationId: 'list-searchable-fields',
            parameters: [
              {
                name: 'dataset',
                in: 'path',
                description: 'Name of the dataset.',
                required: true,
                example: 'oa_citations',
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'version',
                in: 'path',
                description: 'Version of the dataset.',
                required: true,
                example: 'v1',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description:
                  'The dataset API for the given version is found and it is accessible to consume.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
              '404': {
                description:
                  'The combination of dataset name and version is not found in the system or it is not published yet to be consumed by public.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        '/{dataset}/{version}/records': {
          post: {
            tags: ['search'],
            summary:
              'Provides search capability for the data set with the given search criteria.',
            description:
              "This API is based on Solr/Lucense Search. The data is indexed using SOLR. This GET API returns the list of all the searchable field names that are in the Solr Index. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the Solr/Lucene Syntax. Please refer https://lucene.apache.org/core/3_6_2/queryparsersyntax.html#Overview for the query syntax. List of field names that are searchable can be determined using above GET api.",
            operationId: 'perform-search',
            parameters: [
              {
                name: 'version',
                in: 'path',
                description: 'Version of the dataset.',
                required: true,
                schema: {
                  type: 'string',
                  default: 'v1',
                },
              },
              {
                name: 'dataset',
                in: 'path',
                description:
                  'Name of the dataset. In this case, the default value is oa_citations',
                required: true,
                schema: {
                  type: 'string',
                  default: 'oa_citations',
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: {
                          type: 'object',
                        },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'No matching record found for the given criteria.',
              },
            },
            requestBody: {
              content: {
                'application/x-www-form-urlencoded': {
                  schema: {
                    type: 'object',
                    properties: {
                      criteria: {
                        description:
                          "Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.",
                        type: 'string',
                        default: '*:*',
                      },
                      start: {
                        description:
                          'Starting record number. Default value is 0.',
                        type: 'integer',
                        default: 0,
                      },
                      rows: {
                        description:
                          "Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.",
                        type: 'integer',
                        default: 100,
                      },
                    },
                    required: ['criteria'],
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          TestPrefix_dataSetList: {
            type: 'object',
            properties: {
              total: {
                type: 'integer',
              },
              apis: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    apiKey: {
                      type: 'string',
                      description: 'To be used as a dataset parameter value',
                    },
                    apiVersionNumber: {
                      type: 'string',
                      description: 'To be used as a version parameter value',
                    },
                    apiUrl: {
                      type: 'string',
                      format: 'uriref',
                      description: "The URL describing the dataset's fields",
                    },
                    apiDocumentationUrl: {
                      type: 'string',
                      format: 'uriref',
                      description: 'A URL to the API console for each API',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  it('can return select paths', async () => {
    const config: Configuration.IDocConfig = {
      componentPathPrefix: 'TestPrefix_',
      paths: {
        '/': {},
        '/{dataset}/{version}/records': {},
      },
    };

    expect(await parseImport(dataDocs.localV3UsptoDoc(), config)).toEqual({
      openapi: '3.0.1',
      servers: [
        {
          url: '{scheme}://developer.uspto.gov/ds-api',
          variables: {
            scheme: {
              description: 'The Data Set API is accessible via https and http',
              enum: ['https', 'http'],
              default: 'https',
            },
          },
        },
      ],
      info: {
        description:
          'The Data Set API (DSAPI) allows the public users to discover and search USPTO exported data sets. This is a generic API that allows USPTO users to make any CSV based data files searchable through API. With the help of GET call, it returns the list of data fields that are searchable. With the help of POST call, data can be fetched based on the filters on the field names. Please note that POST call is used to search the actual data. The reason for the POST call is that it allows users to specify any complex search criteria without worry about the GET size limitations as well as encoding of the input parameters.',
        version: '1.0.0',
        title: 'USPTO Data Set API',
        contact: {
          name: 'Open Data Portal',
          url: 'https://developer.uspto.gov',
          email: 'developer@uspto.gov',
        },
      },
      tags: [
        {
          name: 'metadata',
          description: 'Find out about the data sets',
        },
        {
          name: 'search',
          description: 'Search a data set',
        },
      ],
      paths: {
        '/': {
          get: {
            tags: ['metadata'],
            operationId: 'list-data-sets',
            summary: 'List available data sets',
            responses: {
              '200': {
                description: 'Returns a list of data sets',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_dataSetList',
                    },
                    example: {
                      total: 2,
                      apis: [
                        {
                          apiKey: 'oa_citations',
                          apiVersionNumber: 'v1',
                          apiUrl:
                            'https://developer.uspto.gov/ds-api/oa_citations/v1/fields',
                          apiDocumentationUrl:
                            'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/oa_citations.json',
                        },
                        {
                          apiKey: 'cancer_moonshot',
                          apiVersionNumber: 'v1',
                          apiUrl:
                            'https://developer.uspto.gov/ds-api/cancer_moonshot/v1/fields',
                          apiDocumentationUrl:
                            'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/cancer_moonshot.json',
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        '/{dataset}/{version}/records': {
          post: {
            tags: ['search'],
            summary:
              'Provides search capability for the data set with the given search criteria.',
            description:
              "This API is based on Solr/Lucense Search. The data is indexed using SOLR. This GET API returns the list of all the searchable field names that are in the Solr Index. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the Solr/Lucene Syntax. Please refer https://lucene.apache.org/core/3_6_2/queryparsersyntax.html#Overview for the query syntax. List of field names that are searchable can be determined using above GET api.",
            operationId: 'perform-search',
            parameters: [
              {
                name: 'version',
                in: 'path',
                description: 'Version of the dataset.',
                required: true,
                schema: {
                  type: 'string',
                  default: 'v1',
                },
              },
              {
                name: 'dataset',
                in: 'path',
                description:
                  'Name of the dataset. In this case, the default value is oa_citations',
                required: true,
                schema: {
                  type: 'string',
                  default: 'oa_citations',
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: {
                          type: 'object',
                        },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'No matching record found for the given criteria.',
              },
            },
            requestBody: {
              content: {
                'application/x-www-form-urlencoded': {
                  schema: {
                    type: 'object',
                    properties: {
                      criteria: {
                        description:
                          "Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.",
                        type: 'string',
                        default: '*:*',
                      },
                      start: {
                        description:
                          'Starting record number. Default value is 0.',
                        type: 'integer',
                        default: 0,
                      },
                      rows: {
                        description:
                          "Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.",
                        type: 'integer',
                        default: 100,
                      },
                    },
                    required: ['criteria'],
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          TestPrefix_dataSetList: {
            type: 'object',
            properties: {
              total: {
                type: 'integer',
              },
              apis: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    apiKey: {
                      type: 'string',
                      description: 'To be used as a dataset parameter value',
                    },
                    apiVersionNumber: {
                      type: 'string',
                      description: 'To be used as a version parameter value',
                    },
                    apiUrl: {
                      type: 'string',
                      format: 'uriref',
                      description: "The URL describing the dataset's fields",
                    },
                    apiDocumentationUrl: {
                      type: 'string',
                      format: 'uriref',
                      description: 'A URL to the API console for each API',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  it('can set new tags and run path hook', async () => {
    const testTags = ['TestTag'];
    const testSummary = 'This is a test summary';
    const config: Configuration.IDocConfig = {
      componentPathPrefix: 'TestPrefix_',
      paths: {
        '/pets': {
          tags: testTags,
          onPathComplete: path => {
            path.summary = testSummary;
          },
        },
      },
    };

    expect(await parseImport(dataDocs.localV3PetstoreDoc(), config)).toEqual({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Swagger Petstore',
        description:
          'A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification',
        termsOfService: 'http://swagger.io/terms/',
        contact: {
          name: 'Swagger API Team',
          email: 'apiteam@swagger.io',
          url: 'http://swagger.io',
        },
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
        },
      },
      servers: [
        {
          url: 'http://petstore.swagger.io/api',
        },
      ],
      paths: {
        '/pets': {
          summary: testSummary,
          get: {
            tags: testTags,
            description:
              'Returns all pets from the system that the user has access to\nNam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.\nSed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.\n',
            operationId: 'findPets',
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'tags to filter by',
                required: false,
                style: 'form',
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
              {
                name: 'limit',
                in: 'query',
                description: 'maximum number of results to return',
                required: false,
                schema: {
                  type: 'integer',
                  format: 'int32',
                },
              },
            ],
            responses: {
              '200': {
                description: 'pet response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/TestPrefix_Pet',
                      },
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Error',
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: testTags,
            description:
              'Creates a new pet in the store. Duplicates are allowed',
            operationId: 'addPet',
            requestBody: {
              description: 'Pet to add to the store',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TestPrefix_NewPet',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'pet response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Pet',
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestPrefix_Error',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          TestPrefix_Pet: {
            allOf: [
              {
                $ref: '#/components/schemas/TestPrefix_NewPet',
              },
              {
                type: 'object',
                required: ['id'],
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int64',
                  },
                },
              },
            ],
          },
          TestPrefix_NewPet: {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string',
              },
              tag: {
                type: 'string',
              },
            },
          },
          TestPrefix_Error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'integer',
                format: 'int32',
              },
              message: {
                type: 'string',
              },
            },
          },
        },
      },
    });
  });
});
