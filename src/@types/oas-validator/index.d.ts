// see https://github.com/Mermade/oas-kit/blob/master/packages/oas-validator/index.js#L1465-L1472

type ValidateOptionsResponse = {
  valid: boolean;
  context: string[];
};

export function validate(
  openapi: object,
  options: object,
  callback: (err: any, options: ValidateOptionsResponse) => void
): void;

export function validate(
  openapi: object,
  options: object
): Promise<ValidateOptionsResponse>;
