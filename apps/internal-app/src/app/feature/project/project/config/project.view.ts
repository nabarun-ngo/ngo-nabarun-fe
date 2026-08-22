import {
  detailItemListSection,
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailItemListItem,
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type {
  Project,
  ProjectDashboardSnapshot,
  ProjectRefDataMap,
  ProjectStatus,
} from '../domain';
import { ProjectRefData } from '../domain';

function refLabel(refData: ProjectRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(
  status: ProjectStatus | undefined,
  refData: ProjectRefDataMap,
): ListRowBadge {
  const tone = status === 'ACTIVE'
    ? 'success'
    : status === 'COMPLETED'
      ? 'primary'
      : status === 'CANCELLED'
        ? 'danger'
        : 'neutral';
  return { label: refLabel(refData, ProjectRefData.refDataKey.statuses, status), tone };
}

function money(amount: number | undefined, currency = 'INR'): string {
  if (amount == null) {
    return '-';
  }
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

function budgetUtilization(project: Project): number | undefined {
  if (!project.budget) {
    return undefined;
  }
  return Math.round(((project.spentAmount ?? 0) / project.budget) * 100);
}

export function mapProjectListRow(
  project: Project,
  refData: ProjectRefDataMap = {},
): ListRowItem<Project> {
  return {
    id: project.id,
    title: project.name,
    subtitle: `${project.code} · ${refLabel(refData, ProjectRefData.refDataKey.categories, project.category)}`,
    metaLeft: refLabel(refData, ProjectRefData.refDataKey.phases, project.phase),
    metaRight: project.startDate ? date(project.startDate, 'dd MMM yyyy') : undefined,
    badge: statusBadge(project.status, refData),
    icon: 'work',
    iconTone: 'indigo',
    payload: project,
  };
}

export function buildProjectDetailSections(
  project: Project,
  refData: ProjectRefDataMap,
  userLabels: ReadonlyMap<string, string> = new Map(),
): ListDetailSection[] {
  const utilization = budgetUtilization(project);

  const details = [
    detailTextField('Project code', project.code),
    detailTextField('Project name', project.name),
    detailTextField('Goals', project.description),
    detailTextField(
      'Category',
      refLabel(refData, ProjectRefData.refDataKey.categories, project.category),
    ),
    detailTextField('Status', refLabel(refData, ProjectRefData.refDataKey.statuses, project.status)),
    detailTextField('Phase', refLabel(refData, ProjectRefData.refDataKey.phases, project.phase)),
    detailTextField('Start date', project.startDate ? date(project.startDate) : '-'),
    detailTextField('End date', project.endDate ? date(project.endDate) : '-'),
    detailTextField('Location', project.location || '-'),
    detailTextField(
      'Manager',
      userLabels.get(project.managerId) ?? project.managerId ?? '-',
    ),
    detailTextField(
      'Sponsor',
      project.sponsorId ? userLabels.get(project.sponsorId) ?? project.sponsorId : '-',
    ),
    detailTextField('Visibility', project.isPublic ? 'Public site' : 'Internal only'),
  ];

  const budget = [
    detailTextField('Budget', money(project.budget, project.currency)),
    detailTextField('Spent', money(project.spentAmount, project.currency)),
    detailTextField(
      'Budget utilization',
      utilization != null ? `${utilization}%` : '-',
    ),
    detailTextField(
      'Beneficiaries',
      `${project.actualBeneficiaryCount ?? 0} of ${project.targetBeneficiaryCount ?? '—'}`,
    ),
  ];

  return [
    detailKeyValueSection('project_detail', 'Project details', details),
    detailKeyValueSection('project_budget', 'Budget & progress', budget),
  ];
}

/** Placeholder occupying the async slot while `GET /projects/:id/dashboard` is in flight. */
export const buildProjectDashboardLoading = (): ListDetailSection => ({
  type: 'documents',
  id: 'project_dashboard',
  title: 'Recent activity',
  documents: [],
  loading: true,
});

function progressSummaryItem(
  snapshot?: ProjectDashboardSnapshot,
): ListDetailItemListItem[] {
  const progress = snapshot?.progress;
  if (!progress) {
    return [];
  }
  return [{
    id: 'progress',
    title: 'Progress',
    subtitle: [
      `${progress.activityCount ?? 0} activities`,
      `${progress.goalCount ?? 0} goals`,
      `${progress.milestoneCount ?? 0} milestones`,
      `${progress.beneficiaryCount ?? 0} beneficiaries`,
    ].join(' · '),
    metaLeft: 'Summary',
    metaRight: `${Math.round(progress.budgetUtilization ?? 0)}% of budget used`,
    badge: progress.openRiskCount
      ? { label: `${progress.openRiskCount} open risks`, tone: 'warning' }
      : { label: 'No open risks', tone: 'success' },
  }];
}

export function buildProjectDashboardSection(
  snapshot?: ProjectDashboardSnapshot,
): ListDetailSection {
  const activities: ListDetailItemListItem[] = (snapshot?.recentActivities ?? []).map(activity => ({
    id: activity.id,
    title: activity.name,
    subtitle: activity.scale,
    metaLeft: 'Activity',
    badge: { label: activity.status, tone: 'neutral' },
  }));

  const milestones: ListDetailItemListItem[] = (snapshot?.upcomingMilestones ?? []).map(milestone => ({
    id: milestone.id,
    title: milestone.name,
    subtitle: milestone.targetDate ? date(milestone.targetDate, 'dd MMM yyyy') : undefined,
    metaLeft: 'Milestone',
    badge: { label: milestone.status, tone: 'primary' },
  }));

  return detailItemListSection(
    'project_dashboard',
    'Progress, recent activity & upcoming milestones',
    [...progressSummaryItem(snapshot), ...activities, ...milestones],
    { emptyMessage: 'Nothing recorded for this project yet.' },
  );
}
