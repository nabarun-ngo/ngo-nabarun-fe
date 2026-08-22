import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ListFilterCriteria, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import type { Doc } from 'src/app/shared/models/document.model';

export type ReportStatus = 'DRAFT' | 'APPROVED';

/** A report definition operators can generate — surfaced as a chip on the list. */
export interface ReportType {
  code: string;
  name: string;
  description?: string;
  viewerRoles: string[];
  manageRoles: string[];
  isActive: boolean;
}

/** One generation run of a report type; each regeneration adds a version. */
export interface Report {
  id: string;
  typeCode: string;
  typeName: string;
  status: ReportStatus;
  version: number;
  latestDocumentId?: string;
  parameters: Record<string, unknown>;
  needApproval: boolean;
  requestedById?: string;
  requestedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  approverRoles: string[];
  viewerRoles: string[];
  workflowId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportInput {
  key: string;
  label: string;
  fieldType: string;
  mandatory: boolean;
}

export interface PagedReports {
  content: Report[];
  totalSize: number;
  pageIndex: number;
  pageSize: number;
}

export interface ReportFilterCriteria extends ListFilterCriteria {
  status?: ReportStatus;
}

/** Shared page state: the report catalog drives chips, inputs drive the generate form. */
export interface ReportListContext {
  refData: RefDataMap;
  types: ReportType[];
  activeTypeCode: string;
  inputs: ReportInput[];
  inputOptions: FieldOption[];
}

export type ReportDocument = Doc;
