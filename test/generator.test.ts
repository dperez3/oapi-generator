import './extensions';
import generate from '../src/generator';
import {
  readJson,
  testDocPath,
  clearTestBin,
  dataPaths,
  createTestDocPath,
} from './utility';
import { OpenAPIV3Document } from '../src/docUtility/types';

jest.mock('../src/ui', () => {
  return {
    __esModule: true,
    default: require('./utility').mockUI,
  };
});

beforeEach(() => {
  clearTestBin();
});

describe('generator', () => {
  it('can import single v3 doc', async () => {
    const componentPrefix = 'TestPathPrefix';
    await generate({
      docs: {
        [dataPaths.localV3DocPath]: {
          componentPathPrefix: componentPrefix,
        },
      },
      destination: testDocPath,
    });

    let doc = readJson(testDocPath) as OpenAPIV3Document;

    expect(doc).toEqual({
      openapi: '3.0.0',
      info: {
        title: 'Simple API overview',
        version: '2.0.0',
      },
      paths: {
        '/': {
          get: {
            operationId: 'listVersionsv2',
            summary: 'List API versions',
            responses: {
              '200': {
                description: '200 response',
                content: {
                  'application/json': {
                    examples: {
                      foo: {
                        value: {
                          versions: [
                            {
                              status: 'CURRENT',
                              updated: '2011-01-21T11:33:21Z',
                              id: 'v2.0',
                              links: [
                                {
                                  href: 'http://127.0.0.1:8774/v2/',
                                  rel: 'self',
                                },
                              ],
                            },
                            {
                              status: 'EXPERIMENTAL',
                              updated: '2013-07-23T11:33:21Z',
                              id: 'v3.0',
                              links: [
                                {
                                  href: 'http://127.0.0.1:8774/v3/',
                                  rel: 'self',
                                },
                              ],
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
              '300': {
                description: '300 response',
                content: {
                  'application/json': {
                    examples: {
                      foo: {
                        value:
                          '{\n "versions": [\n       {\n         "status": "CURRENT",\n         "updated": "2011-01-21T11:33:21Z",\n         "id": "v2.0",\n         "links": [\n             {\n                 "href": "http://127.0.0.1:8774/v2/",\n                 "rel": "self"\n             }\n         ]\n     },\n     {\n         "status": "EXPERIMENTAL",\n         "updated": "2013-07-23T11:33:21Z",\n         "id": "v3.0",\n         "links": [\n             {\n                 "href": "http://127.0.0.1:8774/v3/",\n                 "rel": "self"\n             }\n         ]\n     }\n ]\n}\n',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/v2': {
          get: {
            operationId: 'getVersionDetailsv2',
            summary: 'Show API version details',
            responses: {
              '200': {
                description: '200 response',
                content: {
                  'application/json': {
                    examples: {
                      foo: {
                        value: {
                          version: {
                            status: 'CURRENT',
                            updated: '2011-01-21T11:33:21Z',
                            'media-types': [
                              {
                                base: 'application/xml',
                                type:
                                  'application/vnd.openstack.compute+xml;version=2',
                              },
                              {
                                base: 'application/json',
                                type:
                                  'application/vnd.openstack.compute+json;version=2',
                              },
                            ],
                            id: 'v2.0',
                            links: [
                              {
                                href: 'http://127.0.0.1:8774/v2/',
                                rel: 'self',
                              },
                              {
                                href:
                                  'http://docs.openstack.org/api/openstack-compute/2/os-compute-devguide-2.pdf',
                                type: 'application/pdf',
                                rel: 'describedby',
                              },
                              {
                                href:
                                  'http://docs.openstack.org/api/openstack-compute/2/wadl/os-compute-2.wadl',
                                type: 'application/vnd.sun.wadl+xml',
                                rel: 'describedby',
                              },
                              {
                                href:
                                  'http://docs.openstack.org/api/openstack-compute/2/wadl/os-compute-2.wadl',
                                type: 'application/vnd.sun.wadl+xml',
                                rel: 'describedby',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              '203': {
                description: '203 response',
                content: {
                  'application/json': {
                    examples: {
                      foo: {
                        value: {
                          version: {
                            status: 'CURRENT',
                            updated: '2011-01-21T11:33:21Z',
                            'media-types': [
                              {
                                base: 'application/xml',
                                type:
                                  'application/vnd.openstack.compute+xml;version=2',
                              },
                              {
                                base: 'application/json',
                                type:
                                  'application/vnd.openstack.compute+json;version=2',
                              },
                            ],
                            id: 'v2.0',
                            links: [
                              {
                                href: 'http://23.253.228.211:8774/v2/',
                                rel: 'self',
                              },
                              {
                                href:
                                  'http://docs.openstack.org/api/openstack-compute/2/os-compute-devguide-2.pdf',
                                type: 'application/pdf',
                                rel: 'describedby',
                              },
                              {
                                href:
                                  'http://docs.openstack.org/api/openstack-compute/2/wadl/os-compute-2.wadl',
                                type: 'application/vnd.sun.wadl+xml',
                                rel: 'describedby',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {},
    });
  });

  it('can import two v3 docs', async () => {
    const destination = createTestDocPath('twov3docs');
    const componentPrefix = 'TestPathPrefix';
    await generate({
      docs: {
        [dataPaths.localV3DocPath]: {
          componentPathPrefix: componentPrefix,
        },
        [dataPaths.localV3PetstorePath]: {
          componentPathPrefix: 'PetStore',
        },
      },
      destination: destination,
    });

    let doc = readJson(destination) as OpenAPIV3Document;

    expect(doc).toEqual({
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
                        $ref: '#/components/schemas/PetStorePet',
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
                      $ref: '#/components/schemas/PetStoreError',
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
                    $ref: '#/components/schemas/PetStoreNewPet',
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
                      $ref: '#/components/schemas/PetStorePet',
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/PetStoreError',
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
                      $ref: '#/components/schemas/PetStorePet',
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/PetStoreError',
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
                      $ref: '#/components/schemas/PetStoreError',
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
          PetStorePet: {
            allOf: [
              {
                $ref: '#/components/schemas/PetStoreNewPet',
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
          PetStoreNewPet: {
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
          PetStoreError: {
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
