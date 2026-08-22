import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, switchMap, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { claimHttpError } from 'src/app/shared/utils/http-error.util';
import { saveAs } from 'src/app/shared/utils/utilities.service';
import type { ReportDataSource } from '../data/report-data.source';
import type { Report, ReportFilterCriteria, ReportListContext } from '../domain';
import {
  buildReportFilterForm,
  buildReportGenerateForm,
  defaultReportGenerateValues,
  missingMandatoryInput,
  reportCriteriaToValues,
  reportGenerateParameters,
  reportValuesToCriteria,
} from './report.forms';
import {
  buildReportAppliedFilters,
  cloneReportCriteria,
  countActiveReportSheetFilters,
  defaultReportChip,
  defaultReportCriteria,
  isApproved,
  isDraft,
  isReportTypeChip,
  normalizeReportChip,
  removeReportFilterById,
  reportTypeChips,
  resolveReportPermissions,
} from './report.rules';
import {
  buildReportDetailSections,
  buildReportVersions,
  buildReportVersionsLoading,
  mapReportListRow,
} from './report.view';

export type ReportListOperations = {
  regenerateReport(report: Report): void;
  approveReport(report: Report): void;
  downloadReport(report: Report): void;
  deleteReport(report: Report): void;
};

export type ReportListConfig = ListDashboardConfig<
  Report,
  ReportFilterCriteria,
  ReportListContext,
  ReportListOperations
>;

const PAGE_SIZE = 20;

const REPORT_ROUTE_FILTER_BINDINGS = [
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
];

export function createReportListConfig(deps: {
  data: ReportDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: ReportListContext;
  reloadList?: () => void;
}): ReportListConfig {
  const permissions = () => resolveReportPermissions(deps.authorization, deps.context);
  const activeType = () => deps.context.types.find(type => type.code === deps.context.activeTypeCode);

  const notify = (title: string, description: string, level: 'success' | 'error', error?: unknown) => {
    if (level === 'error') {
      claimHttpError(error);
    }
    deps.modal.openNotificationModal({ title, description }, 'notification', level);
  };

  const errorText = (error: unknown, fallback: string): string => {
    const err = error as { error?: { message?: string }; message?: string } | undefined;
    return err?.error?.message ?? err?.message ?? fallback;
  };

  const afterChange = (title: string, report: Report) => {
    deps.reloadList?.();
    notify(title, `Report ${report.id}`, 'success');
  };

  return {
    meta: {
      id: 'reports',
      title: 'Reports',
      pageName: 'Reports',
      searchPlaceholder: 'Search by report id',
      filterSheetTitle: 'Filter reports',
      emptyMessage: 'No reports have been generated for this report type yet.',
      detailRouteSync: { idParam: 'reportId' },
    },
    list: {
      pageSize: PAGE_SIZE,
      chips: reportTypeChips(deps.context.types),
      defaultChip: defaultReportChip(deps.context.types),
      isValidChip: chipId => isReportTypeChip(chipId, deps.context.types),
      route: {
        chipConfig: {
          param: 'reportCode',
          defaultChip: defaultReportChip(deps.context.types),
          normalize: chip => normalizeReportChip(chip, deps.context.types),
        },
        filterBindings: REPORT_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneReportCriteria,
      getDefaultCriteriaForChip: () => defaultReportCriteria(),
      buildFilterFormDefinition: () => buildReportFilterForm(),
      criteriaToFilterFormValues: (_chip, criteria) => reportCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        reportValuesToCriteria(values, criteria),
      buildAppliedFilters: criteria => buildReportAppliedFilters(criteria),
      countActiveSheetFilters: criteria => countActiveReportSheetFilters(criteria),
      removeFilterById: removeReportFilterById,
      loadPage: query => {
        const typeCode = normalizeReportChip(query.chipId, deps.context.types);
        deps.context.activeTypeCode = typeCode;
        if (!typeCode) {
          return of({ items: [], totalSize: 0, pageIndex: 0, pageSize: PAGE_SIZE });
        }
        const criteria = query.criteria as ReportFilterCriteria;
        const search = (query.searchText ?? '').trim().toLowerCase();
        return deps.data.loadListPage({
          typeCode,
          status: criteria.status,
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
        }).pipe(
          map(page => ({
            items: page.content
              .filter(report => !search || report.id.toLowerCase().includes(search))
              .map(mapReportListRow),
            totalSize: page.totalSize,
            pageIndex: page.pageIndex,
            pageSize: page.pageSize,
          })),
          catchError(() => of({
            items: [],
            totalSize: 0,
            pageIndex: query.pageIndex,
            pageSize: PAGE_SIZE,
          })),
        );
      },
      mapToListRow: report => mapReportListRow(report),
    },
    detail: {
      getTitle: report => `${report.typeName} · ${report.id}`,
      getEntityId: report => report.id,
      buildViewSections: report => buildReportDetailSections(report),
      documents: {
        buildLoadingSection: buildReportVersionsLoading,
        loadSection: id => deps.data.fetchReportVersions(id).pipe(
          map(buildReportVersions),
          catchError(() => of(buildReportVersions([]))),
        ),
      },
      fetchById: () => of(undefined),
      findInList: (items, id) => items
        .map(item => item.payload as Report | undefined)
        .find(report => report?.id === id),
      // Reports are generated, never hand-edited; the detail sheet stays read-only.
      edit: {
        buildEditSummary: () => [],
        buildEditForm: () => ({
          id: 'report-noop',
          key: 'report-noop',
          label: 'Report',
          description: null,
          fields: [],
        }),
        entityToEditValues: () => ({}),
        save: () => throwError(() => new Error('Reports cannot be edited.')),
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'generate' },
      canOpen: () => !!permissions().showCreateFab,
      buildCreateForm: () =>
        buildReportGenerateForm(activeType()?.name ?? 'report', deps.context.inputs),
      defaultCreateValues: () => defaultReportGenerateValues(deps.context.inputs),
      saveLabel: 'Generate',
      validateBeforeCreate: values => {
        const missing = missingMandatoryInput(deps.context.inputs, values);
        return missing ? `${missing.label} is required.` : undefined;
      },
      createSave: values => {
        const typeCode = deps.context.activeTypeCode;
        if (!typeCode) {
          return throwError(() => new Error('Choose a report type first.'));
        }
        return deps.data.generateReport(
          typeCode,
          reportGenerateParameters(deps.context.inputs, values),
        );
      },
    },
    permissions: { resolve: permissions },
    preparation: {
      tasks: [
        {
          id: 'reportInputs',
          cache: {
            policy: 'byInputs',
            inputs: (context: ReportListContext) => context.activeTypeCode,
          },
          run: async (context: ReportListContext) => {
            context.inputs = context.activeTypeCode
              ? await firstValueFrom(
                  deps.data.fetchReportInputs(context.activeTypeCode).pipe(catchError(() => of([]))),
                )
              : [];
            return context.inputs;
          },
        },
      ],
      triggers: { createOpen: ['reportInputs'] },
    },
    operations: {
      regenerateReport(report: Report) {
        deps.modal.openNotificationModal({
          title: 'Regenerate report?',
          description: `Rebuild ${report.id} with the same parameters. This adds a new version.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.regenerateReport(report.id).subscribe({
            next: updated => afterChange('Regenerated', updated),
            error: error => notify(
              'Regenerate failed',
              errorText(error, 'Unable to regenerate this report.'),
              'error',
              error,
            ),
          });
        });
      },
      approveReport(report: Report) {
        deps.modal.openNotificationModal({
          title: 'Approve report?',
          description: `Approving ${report.id} publishes version ${report.version} and stops further regeneration.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.approveReport(report.id).subscribe({
            next: updated => afterChange('Approved', updated),
            error: error => notify(
              'Approval failed',
              errorText(error, 'Unable to approve this report.'),
              'error',
              error,
            ),
          });
        });
      },
      downloadReport(report: Report) {
        deps.data.fetchReportVersions(report.id).pipe(
          map(documents =>
            documents.find(document => document.id === report.latestDocumentId) ?? documents[0]),
          switchMap(document => document
            ? deps.data.downloadDocument(document.id).pipe(
                map(blob => ({ blob, fileName: document.fileName })),
              )
            : throwError(() => new Error('This report has no generated file yet.'))),
        ).subscribe({
          next: ({ blob, fileName }) => saveAs(blob, fileName),
          error: error => notify(
            'Download failed',
            errorText(error, 'Unable to download this report.'),
            'error',
            error,
          ),
        });
      },
      deleteReport(report: Report) {
        deps.modal.openNotificationModal({
          title: 'Delete report?',
          description: `Delete ${report.id} and every generated version. This cannot be undone.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.deleteReport(report.id).subscribe({
            next: () => {
              deps.reloadList?.();
              notify('Deleted', `Report ${report.id}`, 'success');
            },
            error: error => notify(
              'Delete failed',
              errorText(error, 'Unable to delete this report.'),
              'error',
              error,
            ),
          });
        });
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'approve',
          label: 'Approve',
          appearance: 'primary',
          when: ctx => isDraft(ctx.entity as Report | undefined) && !!permissions().canApprove,
          run: 'approveReport',
        },
        {
          id: 'regenerate',
          label: 'Regenerate',
          appearance: 'secondary',
          when: ctx => isDraft(ctx.entity as Report | undefined) && !!permissions().canRegenerate,
          run: 'regenerateReport',
        },
        {
          id: 'download',
          label: 'Download',
          appearance: 'primary',
          when: ctx => {
            const report = ctx.entity as Report | undefined;
            return isApproved(report) && !!report?.latestDocumentId;
          },
          run: 'downloadReport',
        },
      ],
      detailMenu: [
        {
          id: 'delete',
          label: 'Delete',
          icon: 'delete',
          when: ctx => isDraft(ctx.entity as Report | undefined) && !!permissions().canDelete,
          run: 'deleteReport',
        },
      ],
      floating: [
        {
          id: 'generate',
          label: 'Generate report',
          appearance: 'fab',
          icon: 'add',
          when: () => !!permissions().showCreateFab,
          run: 'openCreate',
        },
      ],
    },
  };
}
