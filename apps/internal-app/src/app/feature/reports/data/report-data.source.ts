import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  PagedReports,
  Report,
  ReportDocument,
  ReportInput,
  ReportStatus,
  ReportType,
} from '../domain';

export interface ReportListPageQuery {
  typeCode: string;
  status?: ReportStatus;
  pageIndex: number;
  pageSize: number;
}

export interface ReportDataSource {
  listReportTypes(): Observable<ReportType[]>;
  loadListPage(query: ReportListPageQuery): Observable<PagedReports>;
  fetchReportInputs(typeCode: string): Observable<ReportInput[]>;
  /** Every generated version of a report, newest first. */
  fetchReportVersions(reportId: string): Observable<ReportDocument[]>;
  generateReport(typeCode: string, parameters: Record<string, unknown>): Observable<unknown>;
  regenerateReport(reportId: string): Observable<Report>;
  approveReport(reportId: string): Observable<Report>;
  deleteReport(reportId: string): Observable<void>;
  downloadDocument(documentId: string): Observable<Blob>;
}

export const ReportDataSource = new InjectionToken<ReportDataSource>('ReportDataSource');
