export type reportManageTab = 'draft_reports' | 'approved_reports';

export const ReportDefaultValue = {
  pageNumber: 0,
  pageSize: 10,
  pageSizeOptions: [10, 20, 50],
  pageTitle: 'Manage Reports',
  tabName: 'draft_reports' as reportManageTab,
};
