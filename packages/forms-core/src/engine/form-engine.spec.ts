import { describe, expect, it } from 'vitest';
import type { FormDefinition } from '../models/types.js';
import { FormEngine } from './form-engine-class.js';

describe('FormEngine dependent fields', () => {
  const definition: FormDefinition = {
    id: 'f1',
    key: 'f1',
    label: 'Test',
    description: null,
    fields: [
      {
        id: '1',
        key: 'parent',
        label: 'Parent',
        fieldType: 'select',
        mandatory: false,
        fieldOptions: [{ key: 'a', label: 'A' }],
        isHidden: false,
        isEncrypted: false,
        enabled: true,
        sortOrder: 1,
        condition: null,
        dependentOptions: null,
        validationRules: null,
      },
      {
        id: '2',
        key: 'child',
        label: 'Child',
        fieldType: 'select',
        mandatory: false,
        fieldOptions: [],
        isHidden: false,
        isEncrypted: false,
        enabled: true,
        sortOrder: 2,
        condition: null,
        dependentOptions: {
          dependsOnKey: 'parent',
          optionMap: {
            a: [{ key: 'x', label: 'X' }],
          },
        },
        validationRules: null,
      },
    ],
  };

  it('clears child when parent changes and option is invalid', () => {
    const engine = new FormEngine(definition, { parent: 'a', child: 'x' });
    engine.setValue('parent', '');
    expect(engine.getValues().child).toBe('');
  });
});
