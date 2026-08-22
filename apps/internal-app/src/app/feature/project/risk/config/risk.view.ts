import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { ProjectRisk, RiskRefDataMap, RiskSeverity } from '../domain';
import { RiskRefData } from '../domain';

function refLabel(refData: RiskRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function severityBadge(
  severity: RiskSeverity | undefined,
  refData: RiskRefDataMap,
): ListRowBadge {
  const tone = severity === 'CRITICAL' || severity === 'HIGH'
    ? 'danger'
    : severity === 'MEDIUM'
      ? 'warning'
      : 'neutral';
  return { label: refLabel(refData, RiskRefData.refDataKey.severities, severity), tone };
}

export function mapRiskListRow(
  risk: ProjectRisk,
  refData: RiskRefDataMap = {},
  userLabels: ReadonlyMap<string, string> = new Map(),
): ListRowItem<ProjectRisk> {
  return {
    id: risk.id,
    title: risk.title,
    subtitle: refLabel(refData, RiskRefData.refDataKey.categories, risk.category),
    metaLeft: refLabel(refData, RiskRefData.refDataKey.statuses, risk.status),
    metaRight: risk.ownerId
      ? userLabels.get(risk.ownerId) ?? undefined
      : undefined,
    badge: severityBadge(risk.severity, refData),
    icon: 'warning',
    iconTone: 'red',
    payload: risk,
  };
}

export function buildRiskDetailSections(
  risk: ProjectRisk,
  refData: RiskRefDataMap,
  labels: { projectLabel?: string; users?: ReadonlyMap<string, string> } = {},
): ListDetailSection[] {
  return [
    detailKeyValueSection('risk_detail', 'Risk details', [
      detailTextField('Risk', risk.title),
      detailTextField('Project', labels.projectLabel ?? risk.projectId),
      detailTextField('Description', risk.description || '-'),
      detailTextField(
        'Category',
        refLabel(refData, RiskRefData.refDataKey.categories, risk.category),
      ),
      detailTextField('Status', refLabel(refData, RiskRefData.refDataKey.statuses, risk.status)),
      detailTextField(
        'Severity',
        refLabel(refData, RiskRefData.refDataKey.severities, risk.severity),
      ),
      detailTextField(
        'Probability',
        refLabel(refData, RiskRefData.refDataKey.probabilities, risk.probability),
      ),
      detailTextField(
        'Owner',
        risk.ownerId ? labels.users?.get(risk.ownerId) ?? risk.ownerId : '-',
      ),
    ]),
    detailKeyValueSection('risk_response', 'Impact & response', [
      detailTextField('Impact', risk.impact || '-'),
      detailTextField('Mitigation plan', risk.mitigationPlan || '-'),
      detailTextField(
        'Identified on',
        risk.identifiedDate ? date(risk.identifiedDate) : '-',
      ),
      detailTextField('Resolved on', risk.resolvedDate ? date(risk.resolvedDate) : '-'),
      detailTextField('Notes', risk.notes || '-'),
    ]),
  ];
}
