import { readdirSync, readJsonSync } from 'fs-extra';
import { resolve } from 'path';
import '../extensions';

const allJsonFilesInHere = readdirSync(__dirname).filter(x =>
  x.endsWith('.json')
);

describe('test data', () => {
  // TODO: Use test.each instead
  allJsonFilesInHere.forEach(jsonFile => {
    it(`${jsonFile} is valid`, () => {
      const doc = readJsonSync(resolve(__dirname, jsonFile));
      expect(doc).toBeValidDocument();
    });
  });
});
