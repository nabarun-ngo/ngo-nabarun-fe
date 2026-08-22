import { baseField, type FormDefinition, type FormValues } from '@nabarun-ngo/forms-core';
import type { QueueJobListCriteria } from '../domain';

export function buildQueueJobFilterForm(): FormDefinition {
  return {
    id: 'queue-job-filter',
    key: 'queue-job-filter',
    label: 'Filters',
    description: null,
    fields: [
      baseField({
        id: 'jobName',
        key: 'jobName',
        label: 'Handler / job name',
        fieldType: 'text',
        mandatory: false,
        sortOrder: 1,
        placeholder: 'e.g. SendDailyDonationDigestJob',
      }),
      baseField({
        id: 'queueName',
        key: 'queueName',
        label: 'Queue',
        fieldType: 'text',
        mandatory: false,
        sortOrder: 2,
        placeholder: 'Any queue',
      }),
    ],
  };
}

export function queueJobCriteriaToValues(criteria: QueueJobListCriteria): FormValues {
  return {
    jobName: criteria.jobName ?? '',
    queueName: criteria.queueName ?? '',
  };
}

export function queueJobValuesToCriteria(values: FormValues): QueueJobListCriteria {
  return {
    jobName: String(values['jobName'] ?? '').trim() || undefined,
    queueName: String(values['queueName'] ?? '').trim() || undefined,
  };
}
