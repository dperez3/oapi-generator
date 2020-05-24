import { OpenAPIV3 } from 'openapi-types';

export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveComponents(
        expectedComponentPathPrefix: string,
        originalComponents: string[] | OpenAPIV3.ComponentsObject
      ): R;
    }
  }
}

expect.extend({
  toHaveComponents(
    { components }: OpenAPIV3.Document,
    expectedComponentPathPrefix: string,
    originalComponents: string[] | OpenAPIV3.ComponentsObject
  ) {
    throw new Error('originalComponents not implemented.');
    console.log('expect', components);

    for (const componentCategoryKey in components) {
      const componentCategory = (components as any)[componentCategoryKey];

      for (const componentKey in componentCategory) {
        if (!componentKey.startsWith(expectedComponentPathPrefix)) {
          return {
            message: () =>
              `expected ${componentKey} to start with ${expectedComponentPathPrefix}.`,
            pass: false,
          };
        }
      }
    }

    return {
      message: () =>
        `expected all components nor to start with ${expectedComponentPathPrefix}.`,
      pass: true,
    };
  },
});
