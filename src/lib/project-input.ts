export type CreateProjectInput = {
  name: string;
  address: string;
  clientName: string;
  code: string;
};

export type ProjectInputResult =
  | { ok: true; value: CreateProjectInput }
  | { ok: false; errors: Record<string, string> };

function clean(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function makeProjectCode(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'SITE';
}

export function validateProjectInput(input: CreateProjectInput): ProjectInputResult {
  const value: CreateProjectInput = {
    name: clean(input.name),
    address: clean(input.address),
    clientName: clean(input.clientName),
    code: clean(input.code).toUpperCase() || makeProjectCode(input.name),
  };
  const errors: Record<string, string> = {};

  if (!value.name) errors.name = 'Enter a site name.';
  if (!value.address) errors.address = 'Enter the site address.';

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
