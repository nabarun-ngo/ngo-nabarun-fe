import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRiskDetailDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type ProjectRisk = ProjectRiskDetailDto;

export type RiskStatus = ProjectRiskDetailDto['status'];
export type RiskSeverity = ProjectRiskDetailDto['severity'];
export type RiskProbability = ProjectRiskDetailDto['probability'];
export type RiskCategory = ProjectRiskDetailDto['category'];

export interface PagedRisks {
  content?: ProjectRisk[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type RiskPrimaryChip = 'all' | 'open' | 'closed';

export interface RiskFilterCriteria {
  [key: string]: unknown;
  projectId?: string;
  status?: RiskStatus;
  severity?: RiskSeverity;
  category?: RiskCategory;
  ownerId?: string;
}

export const RiskRefData = {
  refDataKey: {
    statuses: 'riskStatuses',
    severities: 'riskSeverities',
    probabilities: 'riskProbabilities',
    categories: 'riskCategories',
  },
} as const;

export type RiskRefDataMap = Record<string, KeyValue[] | undefined>;

/** Risk enums are absent from the reference-data endpoint. */
export const RISK_STATUSES: KeyValue[] = [
  { key: 'IDENTIFIED', displayValue: 'Identified' },
  { key: 'MONITORING', displayValue: 'Monitoring' },
  { key: 'MITIGATED', displayValue: 'Mitigated' },
  { key: 'CLOSED', displayValue: 'Closed' },
  { key: 'OCCURRED', displayValue: 'Occurred' },
];

export const RISK_SEVERITIES: KeyValue[] = [
  { key: 'LOW', displayValue: 'Low' },
  { key: 'MEDIUM', displayValue: 'Medium' },
  { key: 'HIGH', displayValue: 'High' },
  { key: 'CRITICAL', displayValue: 'Critical' },
];

export const RISK_PROBABILITIES: KeyValue[] = [
  { key: 'LOW', displayValue: 'Low' },
  { key: 'MEDIUM', displayValue: 'Medium' },
  { key: 'HIGH', displayValue: 'High' },
];

export const RISK_CATEGORIES: KeyValue[] = [
  { key: 'BUDGET', displayValue: 'Budget' },
  { key: 'TIMELINE', displayValue: 'Timeline' },
  { key: 'RESOURCE', displayValue: 'Resource' },
  { key: 'QUALITY', displayValue: 'Quality' },
  { key: 'STAKEHOLDER', displayValue: 'Stakeholder' },
  { key: 'EXTERNAL', displayValue: 'External' },
  { key: 'OTHER', displayValue: 'Other' },
];

export interface RiskListContext {
  [key: string]: unknown;
  refData: RiskRefDataMap;
  projectId?: string;
  projectOptions: FieldOption[];
  userOptions: FieldOption[];
}
