import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type {
  ReportCategoryDto,
  ReportDetailDto,
  ReportInputFieldDto,
} from 'src/app/core/api/api-client/models';
import { DmsService, ReportService } from 'src/app/core/api/api-client/services';
import { mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import type {
  PagedReports,
  Report,
  ReportDocument,
  ReportInput,
  ReportType,
} from '../../domain';
import type { ReportDataSource, ReportListPageQuery } from '../report-data.source';

/** DMS stores report attachments under this entity type; the lookup is case-sensitive. */
const REPORT_ENTITY_TYPE = 'report';

function toReportType(dto: ReportCategoryDto): ReportType {
  return {
    code: dto.reportCode,
    name: dto.reportName || dto.reportCode,
    description: dto.description,
    viewerRoles: dto.viewerRoles ?? [],
    manageRoles: dto.manageRoles ?? [],
    isActive: dto.isActive ?? true,
  };
}

function toReport(dto: ReportDetailDto): Report {
  return {
    id: dto.id,
    typeCode: dto.reportCode,
    typeName: dto.reportName || dto.reportCode,
    status: dto.status,
    version: dto.version ?? 1,
    latestDocumentId: dto.dmsDocumentId,
    parameters: (dto.parameters ?? {}) as Record<string, unknown>,
    needApproval: dto.needApproval ?? false,
    requestedById: dto.requestedById,
    requestedByName: dto.requestedByName,
    approvedById: dto.approvedById,
    approvedByName: dto.approvedByName,
    approvedAt: dto.approvedAt,
    approverRoles: dto.approvers ?? [],
    viewerRoles: dto.viewers ?? [],
    workflowId: dto.workflowId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toReportInput(dto: ReportInputFieldDto): ReportInput {
  return {
    key: dto.key,
    label: dto.label || dto.key,
    fieldType: dto.fieldType,
    mandatory: dto.mandatory ?? false,
  };
}

@Injectable()
export class ReportApiDataSource implements ReportDataSource {
  private readonly reportApi = inject(ReportService);
  private readonly dmsApi = inject(DmsService);

  listReportTypes(): Observable<ReportType[]> {
    return this.reportApi.reportingControllerGetRegisteredReports().pipe(
      map(response => (response.responsePayload ?? []).map(toReportType)),
    );
  }

  loadListPage(query: ReportListPageQuery): Observable<PagedReports> {
    return this.reportApi.reportingControllerListReports({
      reportCode: query.typeCode,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      status: query.status,
    }).pipe(
      map(response => {
        const page = response.responsePayload;
        return {
          content: (page?.content ?? []).map(toReport),
          totalSize: page?.totalSize ?? 0,
          pageIndex: page?.pageIndex ?? query.pageIndex,
          pageSize: page?.pageSize ?? query.pageSize,
        };
      }),
    );
  }

  fetchReportInputs(typeCode: string): Observable<ReportInput[]> {
    return this.reportApi.reportingControllerGetReportInputs({ reportCode: typeCode }).pipe(
      map(response => (response.responsePayload ?? []).map(toReportInput)),
    );
  }

  fetchReportVersions(reportId: string): Observable<ReportDocument[]> {
    return this.dmsApi.dms2ControllerListDocuments({
      entityType: REPORT_ENTITY_TYPE,
      entityId: reportId,
    }).pipe(
      map(response => (response.responsePayload?.data ?? []).map(mapDocDtoToDoc)),
    );
  }

  generateReport(typeCode: string, parameters: Record<string, unknown>): Observable<unknown> {
    return this.reportApi.reportingControllerGenerateReport({
      reportCode: typeCode,
      body: parameters,
    }).pipe(map(response => response.responsePayload));
  }

  regenerateReport(reportId: string): Observable<Report> {
    return this.reportApi.reportingControllerRegenerateReport({ reportId }).pipe(
      map(response => toReport(response.responsePayload)),
    );
  }

  approveReport(reportId: string): Observable<Report> {
    return this.reportApi.reportingControllerApproveReport({ reportId }).pipe(
      map(response => toReport(response.responsePayload)),
    );
  }

  deleteReport(reportId: string): Observable<void> {
    return this.reportApi.reportingControllerDeleteReport({ reportId }).pipe(map(() => undefined));
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.dmsApi.dms2ControllerDownloadDocument({ id: documentId });
  }
}
