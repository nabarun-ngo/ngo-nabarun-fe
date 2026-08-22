import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { Goal, GoalRefDataMap, GoalStatus } from '../domain';
import { GoalRefData } from '../domain';

function refLabel(refData: GoalRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(status: GoalStatus | undefined, refData: GoalRefDataMap): ListRowBadge {
  const tone = status === 'ACHIEVED'
    ? 'success'
    : status === 'IN_PROGRESS'
      ? 'primary'
      : status === 'FAILED'
        ? 'danger'
        : status === 'PARTIALLY_ACHIEVED'
          ? 'warning'
          : 'neutral';
  return { label: refLabel(refData, GoalRefData.refDataKey.statuses, status), tone };
}

export function goalProgressLabel(goal: Goal): string {
  if (!goal.targetValue) {
    return `${goal.currentValue ?? 0} recorded`;
  }
  const percent = Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100);
  return `${goal.currentValue ?? 0} of ${goal.targetValue} (${percent}%)`;
}

export function mapGoalListRow(goal: Goal, refData: GoalRefDataMap = {}): ListRowItem<Goal> {
  return {
    id: goal.id,
    title: goal.title,
    subtitle: goal.description || undefined,
    metaLeft: refLabel(refData, GoalRefData.refDataKey.priorities, goal.priority),
    metaRight: goalProgressLabel(goal),
    badge: statusBadge(goal.status, refData),
    icon: 'flag',
    iconTone: 'green',
    payload: goal,
  };
}

export function buildGoalDetailSections(
  goal: Goal,
  refData: GoalRefDataMap,
  projectLabel?: string,
): ListDetailSection[] {
  return [
    detailKeyValueSection('goal_detail', 'Goal details', [
      detailTextField('Goal', goal.title),
      detailTextField('Project', projectLabel ?? goal.projectId),
      detailTextField('Description', goal.description || '-'),
      detailTextField('Status', refLabel(refData, GoalRefData.refDataKey.statuses, goal.status)),
      detailTextField(
        'Priority',
        refLabel(refData, GoalRefData.refDataKey.priorities, goal.priority),
      ),
      detailTextField('Progress', goalProgressLabel(goal)),
    ]),
  ];
}
