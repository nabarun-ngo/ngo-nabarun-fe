import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Milestone, MilestoneRefDataMap, MilestoneStatus } from '../domain';
import { MilestoneRefData } from '../domain';

function refLabel(refData: MilestoneRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(
  status: MilestoneStatus | undefined,
  refData: MilestoneRefDataMap,
): ListRowBadge {
  const tone = status === 'ACHIEVED'
    ? 'success'
    : status === 'IN_PROGRESS'
      ? 'primary'
      : status === 'MISSED'
        ? 'danger'
        : status === 'DELAYED'
          ? 'warning'
          : 'neutral';
  return { label: refLabel(refData, MilestoneRefData.refDataKey.statuses, status), tone };
}

export function mapMilestoneListRow(
  milestone: Milestone,
  refData: MilestoneRefDataMap = {},
): ListRowItem<Milestone> {
  return {
    id: milestone.id,
    title: milestone.name,
    subtitle: milestone.description || undefined,
    metaLeft: refLabel(refData, MilestoneRefData.refDataKey.importances, milestone.importance),
    metaRight: milestone.targetDate
      ? `Target ${date(milestone.targetDate, 'dd MMM yyyy')}`
      : undefined,
    badge: statusBadge(milestone.status, refData),
    icon: 'flag_circle',
    iconTone: 'amber',
    payload: milestone,
  };
}

export function buildMilestoneDetailSections(
  milestone: Milestone,
  refData: MilestoneRefDataMap,
  projectLabel?: string,
): ListDetailSection[] {
  return [
    detailKeyValueSection('milestone_detail', 'Milestone details', [
      detailTextField('Milestone', milestone.name),
      detailTextField('Project', projectLabel ?? milestone.projectId),
      detailTextField('Description', milestone.description || '-'),
      detailTextField(
        'Status',
        refLabel(refData, MilestoneRefData.refDataKey.statuses, milestone.status),
      ),
      detailTextField(
        'Importance',
        refLabel(refData, MilestoneRefData.refDataKey.importances, milestone.importance),
      ),
      detailTextField('Target date', milestone.targetDate ? date(milestone.targetDate) : '-'),
      detailTextField('Achieved on', milestone.actualDate ? date(milestone.actualDate) : '-'),
      detailTextField('Notes', milestone.notes || '-'),
    ]),
  ];
}
