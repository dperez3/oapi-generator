import { OpenAPIV3 } from 'openapi-types';

export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWith(prefix: string): R;
      toAllStartWith(prefix: string): R;
      toHaveComponents(
        expectedComponentPathPrefix: string,
        originalComponents: string[] | OpenAPIV3.ComponentsObject
      ): R;
    }
  }
}

expect.extend({
  toStartWith(text: string, prefix: string) {
    const pass = text.startsWith(prefix);

    if (pass) {
      return {
        message: () => `expected ${text} not to start with ${prefix}.`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${text} to start with ${prefix}.`,
        pass: false,
      };
    }
  },
  toAllStartWith(texts: string[], prefix: string) {
    const pass = texts.every(x => x.startsWith(prefix));
    const textsMsg = `[${texts.join(',')}]`;

    if (pass) {
      return {
        message: () => `expected all ${textsMsg} to not start with ${prefix}.`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected all ${textsMsg} to start with ${prefix}.`,
        pass: false,
      };
    }
  },
  toHaveComponents(
    { components }: OpenAPIV3.Document,
    expectedComponentPathPrefix: string
  ) {
    console.error(`toHaveComponents not completely implemented.`);

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
