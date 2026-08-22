import type { EntityTypeOption } from '../domain';

/** Matches backend CustomFormsModule allowedEntityTypes. */
export const CUSTOM_FORM_ENTITY_TYPES: EntityTypeOption[] = [
  { value: 'donation', label: 'Donation' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'public_site', label: 'Public Site' },
];

export const FIELD_OPTIONS_NAMESPACE = 'custom-forms.field-options';
