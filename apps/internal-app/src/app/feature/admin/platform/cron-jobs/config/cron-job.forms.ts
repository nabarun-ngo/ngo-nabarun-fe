import { baseField, type FormDefinition, type FormValues } from '@nabarun-ngo/forms-core';
import { jsonPayloadField, stringifyPayload } from '../../../shared/admin-list.helpers';
import type { AdminCronJob } from '../domain';

function nameField() {
  return baseField({
    id: 'name',
    key: 'name',
    label: 'Job name',
    fieldType: 'text',
    mandatory: true,
    sortOrder: 1,
  });
}

function handlerField(sortOrder: number) {
  return baseField({
    id: 'handler',
    key: 'handler',
    label: 'Handler (BullMQ job class name)',
    fieldType: 'text',
    mandatory: true,
    sortOrder,
  });
}

function descriptionField(sortOrder: number) {
  return baseField({
    id: 'description',
    key: 'description',
    label: 'Description',
    fieldType: 'textarea',
    mandatory: true,
    sortOrder,
  });
}

function expressionField(sortOrder: number) {
  return baseField({
    id: 'expression',
    key: 'expression',
    label: 'Cron expression (5-part)',
    fieldType: 'text',
    mandatory: true,
    placeholder: '0 8 * * *',
    sortOrder,
  });
}

function enabledField(sortOrder: number) {
  return baseField({
    id: 'enabled',
    key: 'enabled',
    label: 'Enabled',
    fieldType: 'toggle',
    mandatory: false,
    sortOrder,
  });
}

export function buildCronJobCreateForm(): FormDefinition {
  return {
    id: 'cron-job-create',
    key: 'cron-job-create',
    label: 'Create cron job',
    description: null,
    fields: [
      nameField(),
      handlerField(2),
      descriptionField(3),
      expressionField(4),
      enabledField(5),
      jsonPayloadField(),
    ],
  };
}

export function buildCronJobEditForm(): FormDefinition {
  return {
    id: 'cron-job-edit',
    key: 'cron-job-edit',
    label: 'Edit cron job',
    description: null,
    fields: [
      handlerField(1),
      descriptionField(2),
      expressionField(3),
      enabledField(4),
      jsonPayloadField(),
    ],
  };
}

export function defaultCronJobCreateValues(): FormValues {
  return {
    name: '',
    handler: '',
    description: '',
    expression: '',
    enabled: true,
    payloadJson: '{\n  \n}',
  };
}

export function cronJobToEditValues(job: AdminCronJob): FormValues {
  return {
    handler: job.handler,
    description: job.description,
    expression: job.expression,
    enabled: job.enabled,
    payloadJson: stringifyPayload(job.inputData),
  };
}
