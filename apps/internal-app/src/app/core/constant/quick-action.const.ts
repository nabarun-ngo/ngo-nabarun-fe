import type {
  NavTileConfig,
  NavTileIcon,
} from 'src/app/shared/components/nav-tiles/nav-tile.model';
import { AppRoute } from './app-routing.const';
import { SCOPE } from './auth-scope.const';

export type QuickActionGroup = 'finance' | 'projects' | 'workflow' | 'admin';

export interface QuickActionRoute {
  url: string;
  queryParams: Record<string, string>;
}

export interface QuickCreateAction {
  id: string;
  label: string;
  group: QuickActionGroup;
  icon: NavTileIcon;
  url: string;
  /** Params that land the list page directly in its create flow. */
  queryParams: Record<string, string>;
  /** Holding any one of these grants the action. */
  permissions: readonly string[];
}

export type QuickEntityId =
  | 'donation'
  | 'guest_donor'
  | 'member_donor'
  | 'account'
  | 'expense'
  | 'earning'
  | 'report'
  | 'request'
  | 'meeting'
  | 'member'
  | 'project'
  | 'activity'
  | 'goal'
  | 'beneficiary'
  | 'milestone'
  | 'project_team_member'
  | 'risk'
  | 'api_key'
  | 'oauth_token'
  | 'cron_job'
  | 'role_catalog_entry';

export interface QuickEntityRoute {
  label: string;
  icon: NavTileIcon;
  url: string;
  /** Query param carrying the record id. There is no generic `id` alias. */
  idParam: string;
  /** Params the list page needs before it allows the update flow (e.g. its chip). */
  contextParams?: Record<string, string>;
  /** Holding any one of these grants the update flow. */
  editPermissions: readonly string[];
  /** False when the update flow opens from the record sheet rather than the URL. */
  urlEditable: boolean;
}

const CREATE_PARAM = 'create';
const EDIT_PARAM = 'edit';
const CHIP_PARAM = 'chip';

export const QUICK_CREATE_ACTIONS: readonly QuickCreateAction[] = [
  {
    id: 'donationCreate',
    label: 'Add donation',
    group: 'finance',
    icon: 'donations',
    url: AppRoute.secured_donation_dashboard_page.url,
    // Donations only accept a new record from the outstanding list.
    queryParams: { [CHIP_PARAM]: 'all_outstanding', donationCreate: 'true' },
    permissions: [SCOPE.create.donation, SCOPE.create.donation_guest],
  },
  {
    id: 'guestDonorCreate',
    label: 'Create guest donor',
    group: 'finance',
    icon: 'donors',
    url: AppRoute.secured_donor_dashboard_page.url,
    queryParams: { [CHIP_PARAM]: 'guest', [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.donor_guest],
  },
  {
    id: 'accountCreate',
    label: 'Create account',
    group: 'finance',
    icon: 'accounts',
    url: AppRoute.secured_account_list_page.url,
    queryParams: { [CHIP_PARAM]: 'active', [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.account],
  },
  {
    id: 'expenseCreate',
    label: 'Add expense',
    group: 'finance',
    icon: 'expenses',
    url: AppRoute.secured_manage_account_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.expense],
  },
  {
    id: 'earningCreate',
    label: 'Add earning',
    group: 'finance',
    icon: 'earnings',
    url: AppRoute.secured_earning_dashboard_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.earning],
  },
  {
    id: 'financeReportCreate',
    label: 'Generate finance report',
    group: 'finance',
    icon: 'reports',
    url: AppRoute.secured_finance_reports_page.url,
    queryParams: { generate: 'true' },
    permissions: [SCOPE.create.reports],
  },
  {
    id: 'requestCreate',
    label: 'New request',
    group: 'workflow',
    icon: 'icon_requests',
    url: AppRoute.secured_request_list_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.requests],
  },
  {
    id: 'meetingCreate',
    label: 'Schedule meeting',
    group: 'workflow',
    icon: 'icon_meetings',
    url: AppRoute.secured_meetings_list_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.meeting],
  },
  {
    id: 'projectCreate',
    label: 'Add project',
    group: 'projects',
    icon: 'projects',
    url: AppRoute.secured_project_list_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.project],
  },
  {
    id: 'activityCreate',
    label: 'Add activity',
    group: 'projects',
    icon: 'activities',
    url: AppRoute.secured_project_activities_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.activity],
  },
  {
    id: 'goalCreate',
    label: 'Add goal',
    group: 'projects',
    icon: 'goals',
    url: AppRoute.secured_project_goals_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.goal],
  },
  {
    id: 'beneficiaryCreate',
    label: 'Enroll beneficiary',
    group: 'projects',
    icon: 'beneficiaries',
    url: AppRoute.secured_project_beneficiaries_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.beneficiary],
  },
  {
    id: 'milestoneCreate',
    label: 'Add milestone',
    group: 'projects',
    icon: 'milestones',
    url: AppRoute.secured_project_milestones_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.milestone],
  },
  {
    id: 'projectTeamMemberCreate',
    label: 'Add team member',
    group: 'projects',
    icon: 'team',
    url: AppRoute.secured_project_team_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.project_team],
  },
  {
    id: 'riskCreate',
    label: 'Log risk',
    group: 'projects',
    icon: 'risks',
    url: AppRoute.secured_project_risks_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.risk],
  },
  {
    id: 'projectReportCreate',
    label: 'Generate project report',
    group: 'projects',
    icon: 'reports',
    url: AppRoute.secured_project_reports_page.url,
    queryParams: { generate: 'true' },
    permissions: [SCOPE.create.reports],
  },
  {
    id: 'apiKeyCreate',
    label: 'Generate API key',
    group: 'admin',
    icon: 'icon_code',
    url: AppRoute.secured_admin_api_keys_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.apikey],
  },
  {
    id: 'oauthTokenCreate',
    label: 'Authorize account',
    group: 'admin',
    icon: 'icon_globe',
    url: AppRoute.secured_admin_oauth_page.url,
    queryParams: { authorize: 'true' },
    permissions: [SCOPE.create.oauth_token],
  },
  {
    id: 'cronJobCreate',
    label: 'Create cron job',
    group: 'admin',
    icon: 'milestones',
    url: AppRoute.secured_admin_cron_jobs_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.update.cron],
  },
  {
    id: 'roleCatalogEntryCreate',
    label: 'Create role entry',
    group: 'admin',
    icon: 'icon_book',
    url: AppRoute.secured_admin_roles_page.url,
    queryParams: { [CREATE_PARAM]: 'true' },
    permissions: [SCOPE.create.roles, SCOPE.create.role_groups, SCOPE.create.permissions],
  },
  {
    id: 'jsonDocumentCreate',
    label: 'Create JSON document',
    group: 'admin',
    icon: 'reports',
    url: AppRoute.secured_admin_json_store_page.url,
    queryParams: { action: 'create' },
    permissions: [SCOPE.create.json_documents],
  },
];

export const QUICK_ENTITY_ROUTES: Record<QuickEntityId, QuickEntityRoute> = {
  donation: {
    label: 'Donation',
    icon: 'donations',
    url: AppRoute.secured_donation_dashboard_page.url,
    idParam: 'donationId',
    contextParams: { [CHIP_PARAM]: 'all_outstanding' },
    editPermissions: [SCOPE.update.donation],
    urlEditable: true,
  },
  guest_donor: {
    label: 'Guest donor',
    icon: 'donors',
    url: AppRoute.secured_donor_dashboard_page.url,
    idParam: 'donorId',
    contextParams: { [CHIP_PARAM]: 'guest' },
    editPermissions: [SCOPE.update.donor_guest],
    urlEditable: true,
  },
  member_donor: {
    label: 'Member donor',
    icon: 'donors',
    url: AppRoute.secured_donor_dashboard_page.url,
    idParam: 'donorId',
    contextParams: { [CHIP_PARAM]: 'member' },
    editPermissions: [SCOPE.update.donor_member],
    urlEditable: true,
  },
  account: {
    label: 'Account',
    icon: 'accounts',
    url: AppRoute.secured_account_list_page.url,
    idParam: 'accountId',
    editPermissions: [SCOPE.update.account],
    urlEditable: false,
  },
  expense: {
    label: 'Expense',
    icon: 'expenses',
    url: AppRoute.secured_manage_account_page.url,
    idParam: 'expenseId',
    contextParams: { [CHIP_PARAM]: 'mine' },
    editPermissions: [SCOPE.update.expense],
    urlEditable: false,
  },
  earning: {
    label: 'Earning',
    icon: 'earnings',
    url: AppRoute.secured_earning_dashboard_page.url,
    idParam: 'earningId',
    editPermissions: [SCOPE.update.earning],
    urlEditable: true,
  },
  report: {
    label: 'Report',
    icon: 'reports',
    url: AppRoute.secured_finance_reports_page.url,
    idParam: 'reportId',
    editPermissions: [],
    urlEditable: false,
  },
  request: {
    label: 'Request',
    icon: 'icon_requests',
    url: AppRoute.secured_request_list_page.url,
    idParam: 'requestId',
    editPermissions: [SCOPE.update.requests],
    urlEditable: false,
  },
  meeting: {
    label: 'Meeting',
    icon: 'icon_meetings',
    url: AppRoute.secured_meetings_list_page.url,
    idParam: 'meetingId',
    editPermissions: [SCOPE.update.meeting],
    urlEditable: false,
  },
  member: {
    label: 'Member',
    icon: 'icon_members',
    url: AppRoute.secured_member_members_page.url,
    idParam: 'memberId',
    editPermissions: [SCOPE.update.users],
    urlEditable: true,
  },
  project: {
    label: 'Project',
    icon: 'projects',
    url: AppRoute.secured_project_list_page.url,
    idParam: 'projectId',
    editPermissions: [SCOPE.update.project],
    urlEditable: true,
  },
  activity: {
    label: 'Activity',
    icon: 'activities',
    url: AppRoute.secured_project_activities_page.url,
    idParam: 'activityId',
    editPermissions: [SCOPE.update.activity],
    urlEditable: true,
  },
  goal: {
    label: 'Goal',
    icon: 'goals',
    url: AppRoute.secured_project_goals_page.url,
    idParam: 'goalId',
    editPermissions: [SCOPE.update.goal],
    urlEditable: true,
  },
  beneficiary: {
    label: 'Beneficiary',
    icon: 'beneficiaries',
    url: AppRoute.secured_project_beneficiaries_page.url,
    idParam: 'beneficiaryId',
    editPermissions: [SCOPE.update.beneficiary],
    urlEditable: true,
  },
  milestone: {
    label: 'Milestone',
    icon: 'milestones',
    url: AppRoute.secured_project_milestones_page.url,
    idParam: 'milestoneId',
    editPermissions: [SCOPE.update.milestone],
    urlEditable: true,
  },
  project_team_member: {
    label: 'Team member',
    icon: 'team',
    url: AppRoute.secured_project_team_page.url,
    idParam: 'memberId',
    editPermissions: [SCOPE.update.project_team],
    urlEditable: true,
  },
  risk: {
    label: 'Risk',
    icon: 'risks',
    url: AppRoute.secured_project_risks_page.url,
    idParam: 'riskId',
    editPermissions: [SCOPE.update.risk],
    urlEditable: true,
  },
  api_key: {
    label: 'API key',
    icon: 'icon_code',
    url: AppRoute.secured_admin_api_keys_page.url,
    idParam: 'keyId',
    editPermissions: [SCOPE.update.apikey],
    urlEditable: false,
  },
  oauth_token: {
    label: 'OAuth connection',
    icon: 'icon_globe',
    url: AppRoute.secured_admin_oauth_page.url,
    idParam: 'tokenId',
    editPermissions: [],
    urlEditable: false,
  },
  cron_job: {
    label: 'Cron job',
    icon: 'milestones',
    url: AppRoute.secured_admin_cron_jobs_page.url,
    idParam: 'jobName',
    editPermissions: [SCOPE.update.cron],
    urlEditable: false,
  },
  role_catalog_entry: {
    label: 'Role catalog entry',
    icon: 'icon_book',
    url: AppRoute.secured_admin_roles_page.url,
    idParam: 'roleCatalogId',
    editPermissions: [SCOPE.update.roles, SCOPE.update.role_groups, SCOPE.update.permissions],
    urlEditable: true,
  },
};

function hasAnyPermission(
  permissions: readonly string[],
  required: readonly string[],
): boolean {
  return required.some(permission => permissions.includes(permission));
}

export function resolveQuickCreateActions(
  permissions: readonly string[],
): QuickCreateAction[] {
  return QUICK_CREATE_ACTIONS.filter(action =>
    hasAnyPermission(permissions, action.permissions),
  );
}

export function canQuickEditEntity(
  entity: QuickEntityId,
  permissions: readonly string[],
): boolean {
  const target = QUICK_ENTITY_ROUTES[entity];
  return target.editPermissions.length > 0
    && hasAnyPermission(permissions, target.editPermissions);
}

/**
 * Route to a record on its list page. `edit` is only honoured for entities whose
 * update flow is URL driven; the rest open the record and expose Update there.
 */
export function buildQuickEntityRoute(
  entity: QuickEntityId,
  entityId: string,
  options: { edit?: boolean; extraParams?: Record<string, string> } = {},
): QuickActionRoute {
  const target = QUICK_ENTITY_ROUTES[entity];
  const queryParams: Record<string, string> = {
    ...target.contextParams,
    [target.idParam]: entityId,
    ...options.extraParams,
  };

  if (options.edit && target.urlEditable) {
    queryParams[EDIT_PARAM] = 'true';
  }

  return { url: target.url, queryParams };
}

export function quickCreateActionToNavTile(
  action: QuickCreateAction,
  extraParams: Record<string, string> = {},
): NavTileConfig {
  return {
    id: action.id,
    label: action.label,
    link: action.url,
    icon: action.icon,
    queryParams: { ...action.queryParams, ...extraParams },
  };
}
