import type { FormDefinition, FormEngineOptions, FormValues } from '@nabarun-ngo/forms-core';
import { validateForm } from '@nabarun-ngo/forms-core';

export type CustomFormResolverOptions = FormEngineOptions;

/**
 * Resolver compatible with react-hook-form that validates visible fields using forms-core.
 */
export function createCustomFormResolver(
  definition: FormDefinition,
  options?: CustomFormResolverOptions,
) {
  return async (values: FormValues) => {
    const result = validateForm(definition, values, options);
    if (result.valid) {
      return { values, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const [key, message] of Object.entries(result.fieldErrors)) {
      errors[key] = { type: 'custom', message };
    }
    return { values: {}, errors };
  };
}

export type { FormValues };
