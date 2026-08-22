import type { ListDetailSection, ListRowItem } from '@nabarun-ngo/list-dashboard-core';
import { kvSection, mapAdminRow, stringifyPayload } from '../../../shared/admin-list.helpers';
import type { AdminCronJob } from '../domain';

export function mapCronJobListRow(job: AdminCronJob): ListRowItem<AdminCronJob> {
  return mapAdminRow({
    id: job.name,
    title: job.name,
    subtitle: job.readableExpression || job.expression,
    metaLeft: job.enabled ? 'Enabled' : 'Disabled',
    metaRight: job.nextRun ? new Date(job.nextRun).toLocaleString() : undefined,
    payload: job,
  });
}

export function buildCronJobDetailSections(job: AdminCronJob): ListDetailSection[] {
  return [
    kvSection('cron_job_meta', 'Cron job', [
      { label: 'Name', value: job.name },
      { label: 'Handler', value: job.handler },
      { label: 'Description', value: job.description },
      { label: 'Expression', value: `${job.expression} (${job.readableExpression})` },
      { label: 'Enabled', value: job.enabled ? 'Yes' : 'No' },
      { label: 'Next run', value: job.nextRun ?? '—' },
      { label: 'Input data', value: stringifyPayload(job.inputData) },
    ]),
  ];
}
