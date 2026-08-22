import {
  detailKeyValueSection,
  detailTextField,
  type ListDetailSection,
  type ListRowBadge,
  type ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { Report, ReportDocument, ReportStatus } from '../domain';
import { REPORT_STATUS_LABEL } from './report.rules';

const VERSIONS_SECTION_ID = 'report_versions';

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: ReportStatus): ListRowBadge {
  return {
    label: REPORT_STATUS_LABEL[status],
    tone: status === 'APPROVED' ? 'success' : 'warning',
  };
}

export function reportParametersSummary(report: Report): string {
  const entries = Object.entries(report.parameters ?? {});
  if (!entries.length) {
    return 'No parameters';
  }
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
}

export function mapReportListRow(report: Report): ListRowItem<Report> {
  return {
    id: report.id,
    title: report.id,
    subtitle: reportParametersSummary(report),
    metaLeft: `Version ${report.version}`,
    metaRight: formatDateTime(report.createdAt),
    badge: statusBadge(report.status),
    icon: 'description',
    iconTone: report.status === 'APPROVED' ? 'green' : 'amber',
    payload: report,
  };
}

export function buildReportDetailSections(report: Report): ListDetailSection[] {
  const sections: ListDetailSection[] = [
    detailKeyValueSection('report_detail', 'Report', [
      detailTextField('Report id', report.id),
      detailTextField('Report type', report.typeName),
      detailTextField('Status', REPORT_STATUS_LABEL[report.status]),
      detailTextField('Latest version', `Version ${report.version}`),
      detailTextField('Requested by', report.requestedByName ?? '—'),
      detailTextField('Generated on', formatDateTime(report.createdAt)),
      detailTextField('Needs approval', report.needApproval ? 'Yes' : 'No'),
      detailTextField('Approved by', report.approvedByName ?? '—'),
      detailTextField('Approved on', report.approvedAt ? formatDateTime(report.approvedAt) : '—'),
    ]),
  ];

  const parameters = Object.entries(report.parameters ?? {});
  if (parameters.length) {
    sections.push(
      detailKeyValueSection(
        'report_parameters',
        'Parameters',
        parameters.map(([key, value]) => detailTextField(key, String(value))),
      ),
    );
  }

  return sections;
}

export function buildReportVersionsLoading(): ListDetailSection {
  return {
    type: 'documents',
    id: VERSIONS_SECTION_ID,
    title: 'Versions',
    documents: [],
    loading: true,
  };
}

/** Every generated version is kept in document storage, newest first. */
export function buildReportVersions(documents: ReportDocument[]): ListDetailSection {
  return {
    type: 'documents',
    id: VERSIONS_SECTION_ID,
    title: 'Versions',
    documents: [...documents].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    loading: false,
  };
}
