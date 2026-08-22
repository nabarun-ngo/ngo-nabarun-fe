import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import { detailContentSection } from '@nabarun-ngo/list-dashboard-core';
import { kvSection } from '../../../shared/admin-list.helpers';
import type { QueueJob, QueueJobStatus } from '../domain';

const STATUS_TONES: Record<QueueJobStatus, ListRowBadge['tone']> = {
  waiting: 'neutral',
  delayed: 'warning',
  active: 'primary',
  completed: 'success',
  failed: 'danger',
};

const STATUS_LABELS: Record<QueueJobStatus, string> = {
  waiting: 'Waiting',
  delayed: 'Delayed',
  active: 'Active',
  completed: 'Completed',
  failed: 'Failed',
};

export function queueJobStatusLabel(status: QueueJobStatus): string {
  return STATUS_LABELS[status] ?? status;
}

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function codeBlock(value: string): string {
  return `<pre>${escapeHtml(value)}</pre>`;
}

function stringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value);
  }
}

export function mapQueueJobListRow(job: QueueJob): ListRowItem<QueueJob> {
  return {
    id: job.id,
    title: job.name || job.id,
    subtitle: job.failedReason || job.id,
    metaLeft: job.queueName,
    metaRight: job.enqueuedAt ? formatDateTime(job.enqueuedAt) : undefined,
    badge: { label: queueJobStatusLabel(job.status), tone: STATUS_TONES[job.status] },
    payload: job,
  };
}

export function buildQueueJobDetailSections(job: QueueJob): ListDetailSection[] {
  const sections: ListDetailSection[] = [
    kvSection('queue-job-summary', 'Job', [
      { label: 'Name', value: job.name },
      { label: 'Job ID', value: job.id },
      { label: 'Queue', value: job.queueName ?? '—' },
      { label: 'State', value: queueJobStatusLabel(job.status) },
      { label: 'Attempts', value: String(job.attemptsMade) },
    ]),
    kvSection('queue-job-timeline', 'Timeline', [
      { label: 'Enqueued', value: formatDateTime(job.enqueuedAt) },
      { label: 'Started', value: formatDateTime(job.startedAt) },
      { label: 'Finished', value: formatDateTime(job.finishedAt) },
    ]),
  ];

  if (job.failedReason) {
    sections.push(detailContentSection(
      'queue-job-failure',
      codeBlock(job.failedReason),
      { title: 'Failure reason' },
    ));
  }

  sections.push(detailContentSection(
    'queue-job-payload',
    codeBlock(stringifyJson(job.payload)),
    { title: 'Payload', collapsed: true },
  ));

  const execution = job.execution;
  if (!execution) {
    sections.push(detailContentSection(
      'queue-job-execution',
      '<p>Loading execution details…</p>',
      { title: 'Execution' },
    ));
    return sections;
  }

  sections.push(kvSection('queue-job-execution', 'Execution', [
    { label: 'Delay', value: execution.delay ? `${execution.delay} ms` : '—' },
    { label: 'Progress', value: stringifyJson(execution.progress) },
    { label: 'Attempts allowed', value: String(execution.options['attempts'] ?? '—') },
  ]));

  if (execution.returnValue !== undefined && execution.returnValue !== null) {
    sections.push(detailContentSection(
      'queue-job-result',
      codeBlock(stringifyJson(execution.returnValue)),
      { title: 'Result', collapsed: true },
    ));
  }

  if (execution.stacktrace.length) {
    sections.push(detailContentSection(
      'queue-job-stacktrace',
      codeBlock(execution.stacktrace.join('\n')),
      { title: 'Stack trace', collapsed: true },
    ));
  }

  if (execution.logs.length) {
    sections.push(detailContentSection(
      'queue-job-logs',
      codeBlock(execution.logs.join('\n')),
      { title: 'Logs', collapsed: true },
    ));
  }

  return sections;
}
