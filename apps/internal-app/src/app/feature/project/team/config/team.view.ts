import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { TeamMember, TeamRefDataMap } from '../domain';
import { TeamRefData } from '../domain';

function refLabel(refData: TeamRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function membershipBadge(member: TeamMember): ListRowBadge {
  return member.isActive
    ? { label: 'Active', tone: 'success' }
    : { label: 'Inactive', tone: 'neutral' };
}

/** The member DTO carries only `userId`, so the display name comes from prepared options. */
export function teamMemberLabel(member: TeamMember, memberLabel?: string): string {
  return memberLabel ?? member.userId;
}

export function mapTeamListRow(
  member: TeamMember,
  refData: TeamRefDataMap = {},
  memberLabel?: string,
): ListRowItem<TeamMember> {
  return {
    id: member.id,
    title: teamMemberLabel(member, memberLabel),
    subtitle: refLabel(refData, TeamRefData.refDataKey.roles, member.role),
    metaLeft: member.hoursAllocated != null ? `${member.hoursAllocated} hrs` : undefined,
    metaRight: member.startDate ? `Since ${date(member.startDate, 'dd MMM yyyy')}` : undefined,
    badge: membershipBadge(member),
    icon: 'badge',
    iconTone: 'indigo',
    payload: member,
  };
}

export function buildTeamDetailSections(
  member: TeamMember,
  refData: TeamRefDataMap,
  labels: { memberLabel?: string; projectLabel?: string } = {},
): ListDetailSection[] {
  return [
    detailKeyValueSection('team_detail', 'Member details', [
      detailTextField('Member', teamMemberLabel(member, labels.memberLabel)),
      detailTextField('Project', labels.projectLabel ?? member.projectId),
      detailTextField('Role', refLabel(refData, TeamRefData.refDataKey.roles, member.role)),
      detailTextField('Membership', member.isActive ? 'Active' : 'Inactive'),
      detailTextField(
        'Hours allocated',
        member.hoursAllocated != null ? `${member.hoursAllocated}` : '-',
      ),
    ]),
    detailKeyValueSection('team_assignment', 'Assignment', [
      detailTextField('Start date', member.startDate ? date(member.startDate) : '-'),
      detailTextField('End date', member.endDate ? date(member.endDate) : '-'),
      detailTextField('Responsibilities', member.responsibilities || '-'),
    ]),
  ];
}
