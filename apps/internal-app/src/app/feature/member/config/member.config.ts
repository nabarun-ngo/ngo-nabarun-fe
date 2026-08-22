import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FormValues } from '@nabarun-ngo/forms-core';
import type {
  ChipFilter,
  InfiniteListPage,
  InfiniteListQuery,
  ListDashboardConfig,
  ListDashboardOperations,
  ListFormStepperStep,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-angular';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import type { UpdateUserProfileDto } from 'src/app/core/api/api-client/models';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import type { MemberDataSource } from '../data/member-data.source';
import type { MemberListCriteria, MemberPrimaryChip, User } from '../domain';
import {
  adminUpdateFormValuesToPatch,
  buildMemberAdminEditSummary,
  buildMemberAdminOnlyUpdateFormDefinition,
  buildMemberChangePasswordFormDefinition,
  buildMemberCreateFormDefinition,
  buildMemberFilterFormDefinition,
  buildMemberProfileStepDefinition,
  buildMemberProfileStepsPlaceholderDefinition,
  criteriaToMemberFilterFormValues,
  defaultMemberCreateValues,
  formatMemberDisplayName,
  memberCreateFormValuesToDto,
  memberFilterFormValuesToCriteria,
  memberProfileFormValuesToUpdateDto,
  memberProfileStepLabel,
  resolveMemberProfileEditSteps,
  userToAdminOnlyFormValues,
  userToMemberProfileFormValues,
  type MemberProfileEditStep,
} from './member.forms';
import {
  buildMemberAppliedFilters,
  cloneMemberCriteria,
  countActiveSheetFilters,
  DEFAULT_MEMBER_CHIP,
  getDefaultCriteriaForChip,
  isMemberPrimaryChip,
  MEMBER_LIST_PAGE_SIZE,
  MEMBER_PRIMARY_CONNECTION_KEY,
  MEMBER_LIST_ROUTE_FILTER_BINDINGS,
  normalizeMemberChipId,
  removeMemberFilterById,
  resolveMemberPermissions,
  UserConstant,
  type MemberPermissions,
} from './member.rules';
import {
  buildMemberDocumentsLoadingSection,
  buildMemberDocumentsSection,
  buildMemberListDetailSections,
  filterMembersByRole,
  mapMemberToListRow,
  mapMembersToListRows,
} from './member.view';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';

export type MemberListOperations = ListDashboardOperations & {
  deleteMember(member: User): void;
};

/** Mutable route context — role / role-group catalog/memberships load into `refData` before admin edit. */
export interface MemberListContext {
  refData: Record<string, KeyValue[]>;
  /** Selected member from the open detail sheet (read when editPrepare runs). */
  getSelectedMember: () => User | undefined;
}

export type MemberListConfig = ListDashboardConfig<
  User,
  MemberListCriteria,
  MemberListContext,
  MemberListOperations
>;

const MEMBER_SELF_EDIT_STEPS: ListFormStepperStep[] = [
  { id: 'picture', label: 'Photo', kind: 'custom' },
  { id: 'personal', label: memberProfileStepLabel('personal'), kind: 'form' },
  { id: 'present_address', label: memberProfileStepLabel('present_address'), kind: 'form' },
  { id: 'permanent_address', label: memberProfileStepLabel('permanent_address'), kind: 'form' },
];

function sameKeySet(left: string[] | undefined, right: string[] | undefined): boolean {
  const a = [...(left ?? [])].sort().join(',');
  const b = [...(right ?? [])].sort().join(',');
  return a === b;
}

function emptyListPage(query: InfiniteListQuery, pageSize: number): InfiniteListPage {
  return {
    items: [],
    totalSize: 0,
    pageIndex: query.pageIndex,
    pageSize,
  };
}

export function createMemberListConfig(deps: {
  data: MemberDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  /** Live chip from the list dashboard; undefined before its view initialises. */
  getActiveChip: () => string | undefined;
  /** Live USER ref data (route + RBAC enrichment). */
  getRefData?: () => Record<string, KeyValue[]>;
  /** Reload the list after destructive actions (e.g. delete). */
  reloadList?: () => void;
}): MemberListConfig {
  const permissions = resolveMemberPermissions(deps.authorization);
  const canReadUsers = permissions.canReadUsers;
  const canManageLoginMethods =
    permissions.canCreateUserConnections && permissions.canDeleteUserConnections;
  const refData = (): Record<string, KeyValue[]> => deps.getRefData?.() ?? {};

  const chips: ChipFilter[] = [
    { id: 'me', label: 'Me' },
    ...(canReadUsers
      ? [
          { id: 'active', label: 'Active' },
          { id: 'past', label: 'Past' },
        ]
      : []),
  ];
  const defaultChip: MemberPrimaryChip = canReadUsers ? DEFAULT_MEMBER_CHIP : 'me';
  const isAllowedChip = (chip: string): chip is MemberPrimaryChip =>
    isMemberPrimaryChip(chip) && (canReadUsers || chip === 'me');

  const activeChip = (): MemberPrimaryChip => {
    const raw = deps.getActiveChip();
    const normalized = raw ? normalizeMemberChipId(raw) : undefined;
    return normalized && isAllowedChip(normalized) ? normalized : defaultChip;
  };
  const isMeChip = (): boolean => activeChip() === 'me';

  const edit = {
    get kind(): 'form' | 'stepper' {
      return isMeChip() ? 'stepper' : 'form';
    },
    get steps() {
      return isMeChip() ? MEMBER_SELF_EDIT_STEPS : undefined;
    },
    customSteps: {
      picture: { rendererKey: 'memberProfilePicture' },
    },
    buildStepDefinition: (
      stepId: string,
      _values: FormValues,
      ctx: { entity: User; refData: Record<string, unknown> },
    ) => buildMemberProfileStepDefinition(
      stepId as MemberProfileEditStep,
      ctx.refData as Record<string, KeyValue[]>,
    ),
    resolveSteps: (values: FormValues) => [
      'picture',
      ...resolveMemberProfileEditSteps(values),
    ],
    buildEditSummary: (ctx: { entity: User; refData: Record<string, unknown> }) => {
      if (isMeChip()) {
        return [
          { label: 'Member', value: formatMemberDisplayName(ctx.entity, ctx.refData as Record<string, KeyValue[]>) },
          { label: 'Email', value: ctx.entity.email },
        ];
      }
      return buildMemberAdminEditSummary(ctx.entity, ctx.refData as Record<string, KeyValue[]>);
    },
    buildEditForm: (ctx: { entity: User; refData: Record<string, unknown> }) => {
      if (isMeChip()) {
        return buildMemberProfileStepsPlaceholderDefinition();
      }
      return buildMemberAdminOnlyUpdateFormDefinition(ctx.refData as Record<string, KeyValue[]>, {
        showLoginMethods: permissions.canReadUserConnections,
        loginMethodsEnabled: canManageLoginMethods,
      });
    },
    entityToEditValues: (entity: User) =>
      isMeChip()
        ? userToMemberProfileFormValues(entity)
        : userToAdminOnlyFormValues(entity),
    refreshEditForm: (ctx: { entity: User; refData: Record<string, unknown> }) => {
      if (isMeChip()) {
        return buildMemberProfileStepsPlaceholderDefinition();
      }
      return buildMemberAdminOnlyUpdateFormDefinition(ctx.refData as Record<string, KeyValue[]>, {
        showLoginMethods: permissions.canReadUserConnections,
        loginMethodsEnabled: canManageLoginMethods,
      });
    },
    validateBeforeSave: () => undefined,
    save: (ctx: {
      entity: User;
      values: FormValues;
      refData: Record<string, unknown>;
      customStepData?: Record<string, unknown>;
    }) => {
      if (isMeChip()) {
        const pictureBase64 = ctx.customStepData?.['picture'] as string | undefined;
        return saveMyProfileWithPicture(
          deps.data,
          ctx.entity,
          ctx.values,
          pictureBase64,
          ctx.refData as Record<string, KeyValue[]>,
        );
      }

      const patch = adminUpdateFormValuesToPatch(ctx.values, ctx.entity);
      const statusChanged = patch.status !== ctx.entity.status;
      const rolesChanged = !sameKeySet(patch.roleCodes, ctx.entity.roleCodes);
      const roleGroupsChanged = !sameKeySet(patch.roleGroupCodes, ctx.entity.roleGroupCodes);
      const permissionsChanged = !sameKeySet(
        patch.permissionCodes,
        ctx.entity.permissionCodes ?? [],
      );
      const currentConnections = ctx.entity.connectionKeys ?? [];
      const connectionsChanged =
        canManageLoginMethods && !sameKeySet(patch.connectionKeys, currentConnections);
      const connectionsToGrant = connectionsChanged
        ? patch.connectionKeys.filter(key => !currentConnections.includes(key))
        : [];
      const connectionsToRevoke = connectionsChanged
        ? currentConnections.filter(
            key => key !== MEMBER_PRIMARY_CONNECTION_KEY && !patch.connectionKeys.includes(key),
          )
        : [];

      let chain: Observable<User> = of(ctx.entity);

      if (statusChanged) {
        chain = chain.pipe(
          switchMap(user =>
            deps.data.updateMemberAdmin(user.id, { status: patch.status }).pipe(
              catchError(() => of(user)),
            ),
          ),
        );
      }

      if (rolesChanged && ctx.entity.idpSub) {
        chain = chain.pipe(
          switchMap(user =>
            deps.data.updateMemberRoles(ctx.entity.idpSub!, patch.roleCodes).pipe(map(() => user)),
          ),
        );
      }

      if (roleGroupsChanged && ctx.entity.idpSub) {
        chain = chain.pipe(
          switchMap(user =>
            deps.data.updateMemberRoleGroups(ctx.entity.idpSub!, patch.roleGroupCodes).pipe(
              map(() => ({ ...user, roleGroupCodes: [...patch.roleGroupCodes] })),
            ),
          ),
        );
      }

      if (permissionsChanged && ctx.entity.idpSub) {
        chain = chain.pipe(
          switchMap(user =>
            deps.data.updateMemberPermissions(ctx.entity.idpSub!, patch.permissionCodes).pipe(
              map(() => ({ ...user, permissionCodes: [...patch.permissionCodes] })),
            ),
          ),
        );
      }

      if (connectionsToGrant.length || connectionsToRevoke.length) {
        chain = chain.pipe(
          switchMap(user => {
            const ops: Observable<unknown>[] = [
              ...connectionsToGrant.map(key => deps.data.grantMemberConnection(user.id, key)),
              ...connectionsToRevoke.map(key => deps.data.revokeMemberConnection(user.id, key)),
            ];
            return forkJoin(ops).pipe(
              map(() => ({ ...user, connectionKeys: [...patch.connectionKeys] })),
            );
          }),
        );
      }

      return chain.pipe(
        switchMap(user => deps.data.fetchMemberById(user.id).pipe(
          map(updated => {
            if (!updated) {
              return user;
            }
            // Role groups + login-method connections live outside the user profile
            // DTO — keep the saved keys so the detail view stays in sync.
            // Role keys: prefer just-saved RBAC selection until denormalized profile catches up.
            return {
              ...updated,
              roleCodes: rolesChanged ? [...patch.roleCodes] : (updated.roleCodes ?? user.roleCodes),
              roles: rolesChanged
                ? patch.roleCodes.map(roleCode => ({ roleCode, roleName: roleCode }))
                : (updated.roles?.length ? updated.roles : user.roles),
              roleGroupCodes: roleGroupsChanged
                ? [...patch.roleGroupCodes]
                : (updated.roleGroupCodes?.length
                  ? updated.roleGroupCodes
                  : user.roleGroupCodes),
              permissionCodes: permissionsChanged
                ? [...patch.permissionCodes]
                : (updated.permissionCodes?.length
                  ? updated.permissionCodes
                  : user.permissionCodes),
              connectionKeys: connectionsChanged
                ? [...patch.connectionKeys]
                : (user.connectionKeys ?? ctx.entity.connectionKeys),
            };
          }),
        )),
        map(updated => updated ?? ctx.entity),
      );
    },
  };

  return {
    list: {
      pageSize: MEMBER_LIST_PAGE_SIZE,
      chips,
      defaultChip,
      isValidChip: isAllowedChip,
      route: {
        chipConfig: {
          defaultChip,
          normalize: chip => {
            const normalized = normalizeMemberChipId(chip);
            return normalized && isAllowedChip(normalized) ? normalized : undefined;
          },
        },
        filterBindings: MEMBER_LIST_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneMemberCriteria,
      getDefaultCriteriaForChip: chipId => getDefaultCriteriaForChip(chipId as MemberPrimaryChip),
      buildFilterFormDefinition: (_chipId, refData) =>
        buildMemberFilterFormDefinition(refData as Record<string, KeyValue[]>),
      criteriaToFilterFormValues: (_chipId, criteria) => criteriaToMemberFilterFormValues(criteria),
      filterFormValuesToCriteria: (_chipId, values) => memberFilterFormValuesToCriteria(values),
      buildAppliedFilters: (criteria, refData) => buildMemberAppliedFilters(criteria, refData),
      removeFilterById: removeMemberFilterById,
      countActiveSheetFilters,
      loadPage: (query, ctx) => {
        const pageSize = MEMBER_LIST_PAGE_SIZE;
        const pageRefData = (ctx?.refData as Record<string, KeyValue[]> | undefined) ?? refData();
        if (query.chipId === 'me') {
          if (query.pageIndex > 0) {
            return of(emptyListPage(query, pageSize));
          }
          return deps.data.getMyProfile().pipe(
            map(user => ({
              items: user ? mapMembersToListRows([user], pageRefData) : [],
              totalSize: user ? 1 : 0,
              pageIndex: 0,
              pageSize,
            })),
            catchError(() => of(emptyListPage(query, pageSize))),
          );
        }
        return deps.data.loadListPage({
          chipId: query.chipId,
          criteria: query.criteria as MemberListCriteria,
          searchText: query.searchText,
          pageIndex: query.pageIndex,
          pageSize,
          append: query.append,
        }).pipe(
          map(page => {
            const criteria = query.criteria as MemberListCriteria;
            const filtered = filterMembersByRole(page.content ?? [], criteria.role);
            const rows = mapMembersToListRows(filtered, pageRefData);
            if (!rows.length && query.pageIndex === 0) {
              return emptyListPage(query, pageSize);
            }
            return {
              items: rows,
              totalSize: criteria.role?.length ? filtered.length : (page.totalSize ?? rows.length),
              pageIndex: page.pageIndex ?? query.pageIndex,
              pageSize: page.pageSize ?? pageSize,
            };
          }),
          catchError(() => of(emptyListPage(query, pageSize))),
        );
      },
      mapToListRow: (entity: User, ctx) =>
        mapMemberToListRow(entity, (ctx.refData as Record<string, KeyValue[]>) ?? refData()),
    },
    detail: {
      getTitle: entity => entity.fullName || entity.email,
      getEntityId: entity => entity.id,
      buildViewSections: (entity, detailRefData) =>
        buildMemberListDetailSections(entity, detailRefData as Record<string, KeyValue[]>),
      documents: {
        buildLoadingSection: () => buildMemberDocumentsLoadingSection(),
        resolveEntityId: entity => entity.id,
        loadSection: entityId =>
          deps.data.fetchDocuments(entityId, refData()).pipe(
            map(documents => buildMemberDocumentsSection(documents)),
            catchError(() => of(buildMemberDocumentsSection([]))),
          ),
      },
      fetchById: id => {
        if (isMeChip()) {
          return deps.data.getMyProfile().pipe(
            map(user => (user.id.toLowerCase() === id.toLowerCase() ? user : undefined)),
            catchError(() => of(undefined)),
          );
        }
        return deps.data.fetchMemberById(id).pipe(catchError(() => of(undefined)));
      },
      findInList: (items: ListRowItem[], id: string) =>
        items
          .map(item => item.payload as User | undefined)
          .find(user => user?.id?.toLowerCase() === id.toLowerCase()),
      primaryAction: {
        label: 'Edit',
        when: ctx => ctx.canUpdate(),
      },
      edit,
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'] && !isMeChip(),
      buildCreateForm: createRefData =>
        buildMemberCreateFormDefinition(createRefData as Record<string, KeyValue[]>),
      defaultCreateValues: () => defaultMemberCreateValues(),
      validateBeforeCreate: values => {
        const email = String(values['email'] ?? '').trim();
        const firstName = String(values['firstName'] ?? '').trim();
        const lastName = String(values['lastName'] ?? '').trim();
        if (!email) {
          return 'Email is required.';
        }
        if (!email.includes('@')) {
          return 'Enter a valid email address.';
        }
        if (!firstName) {
          return 'First name is required.';
        }
        if (!lastName) {
          return 'Last name is required.';
        }
        return undefined;
      },
      createSave: values => deps.data.createMember(memberCreateFormValuesToDto(values)),
    },
    actionForms: {
      changePassword: {
        kind: 'form',
        title: 'Change password',
        saveLabel: 'Continue',
        defaultValues: () => ({ currentPassword: '' }),
        buildForm: () => buildMemberChangePasswordFormDefinition(),
        validateBeforeSave: context => {
          const currentPassword = String(context.values['currentPassword'] ?? '');
          return currentPassword.trim() ? undefined : 'Current password is required.';
        },
        save: context => {
          const currentPassword = String(context.values['currentPassword'] ?? '');
          const redirectUrl = window.location.origin;
          return deps.data.initPasswordChange(currentPassword, redirectUrl).pipe(
            tap(({ ticketUrl }) => {
              window.location.assign(ticketUrl);
            }),
            map(() => context.entity),
          );
        },
        success: {
          mode: 'none',
        },
      },
    },
    operations: {
      deleteMember: (member: User) => {
        const displayName = formatMemberDisplayName(member, refData());
        deps.modal.openNotificationModal({
          title: 'Delete member?',
          description:
            `Delete "${displayName}" (${member.email})? Their sign-in access will be removed ` +
            'and outstanding donations may be cancelled. This cannot be undone from the list.',
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.deleteMember(member.id).subscribe({
            next: () => {
              deps.reloadList?.();
              deps.modal.openNotificationModal({
                title: 'Deleted',
                description: displayName,
              }, 'notification', 'success');
            },
            error: err => notifyFeatureError(deps.modal, err, {
              title: 'Delete failed',
              description: 'Unable to delete this member.',
            }),
          });
        });
      },
    },
    actions: {
      // Self-service only: the API changes the password of the signed-in user.
      detailMenu: [
        {
          id: 'changePassword',
          label: 'Change Password',
          icon: 'lock_reset',
          when: () => isMeChip(),
          run: 'changePassword',
          actionFormId: 'changePassword',
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: 'delete',
          when: ctx => {
            const entity = ctx.entity as User | undefined;
            return (
              !isMeChip()
              && !!ctx.permissions['canDeleteUser']
              && !!entity
              && entity.status !== 'DELETED'
            );
          },
          run: 'deleteMember',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Add member',
          appearance: 'fab',
          icon: 'add',
          when: ctx => !!ctx.permissions['showCreateFab'] && !isMeChip(),
          run: 'openCreate',
        },
      ],
    },
    meta: {
      id: 'member',
      title: 'Member',
      pageName: 'Members',
      searchPlaceholder: 'Search by name, email, or phone',
      filterSheetTitle: 'Member Filters',
      emptyMessage: 'No members match this filter.',
      detailRouteSync: { idParam: 'memberId', idParamAliases: ['id'] },
    },
    permissions: {
      resolve: (): MemberPermissions => resolveMemberPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: ctx =>
        ctx.activeChip === 'me'
        || !!(ctx.permissions as MemberPermissions).canUpdateUser,
    },
    preparation: {
      tasks: [
        {
          id: 'memberRoleMemberships',
          cache: 'none',
          run: async (context: MemberListContext) => {
            const member = context.getSelectedMember();
            if (!member?.idpSub || isMeChip()) {
              return [];
            }
            const keys = await firstValueFrom(deps.data.listMemberRoles(member.idpSub));
            member.roleCodes = keys;
            member.roles = keys.map(roleCode => ({
              roleCode,
              roleName: roleCode,
            }));
            return keys;
          },
        },
        {
          id: 'memberRoleGroupCatalog',
          cache: 'instance',
          run: async (context: MemberListContext) => {
            const groups = await firstValueFrom(deps.data.listRoleGroupsCatalog());
            context.refData[UserConstant.refDataKey.availableRoleGroups] = groups;
            return groups;
          },
        },
        {
          id: 'memberRoleGroupMemberships',
          dependsOn: ['memberRoleGroupCatalog'],
          cache: 'none',
          run: async (context: MemberListContext) => {
            const member = context.getSelectedMember();
            if (!member?.idpSub || isMeChip()) {
              return [];
            }
            const keys = await firstValueFrom(deps.data.listMemberRoleGroups(member.idpSub));
            member.roleGroupCodes = keys;
            return keys;
          },
        },
        {
          id: 'memberPermissionCatalog',
          cache: 'instance',
          run: async (context: MemberListContext) => {
            const permissions = await firstValueFrom(deps.data.listPermissionsCatalog());
            context.refData[UserConstant.refDataKey.availablePermissions] = permissions;
            return permissions;
          },
        },
        {
          id: 'memberPermissionMemberships',
          dependsOn: ['memberPermissionCatalog'],
          cache: 'none',
          run: async (context: MemberListContext) => {
            const member = context.getSelectedMember();
            if (!member?.idpSub || isMeChip()) {
              return [];
            }
            const keys = await firstValueFrom(deps.data.listMemberPermissions(member.idpSub));
            member.permissionCodes = keys;
            return keys;
          },
        },
        {
          id: 'memberConnections',
          cache: 'none',
          run: async (context: MemberListContext) => {
            const member = context.getSelectedMember();
            if (!member?.id || isMeChip() || !permissions.canReadUserConnections) {
              return [];
            }
            const connections = await firstValueFrom(deps.data.listMemberConnections(member.id));
            const keys = connections.map(connection => connection.connectionKey);
            member.connectionKeys = keys;
            return keys;
          },
        },
      ],
      triggers: {
        editPrepare: [
          'memberRoleMemberships',
          'memberRoleGroupCatalog',
          'memberRoleGroupMemberships',
          'memberPermissionCatalog',
          'memberPermissionMemberships',
          'memberConnections',
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Self profile save helper (Me chip + complete-profile page)
// ---------------------------------------------------------------------------

function uploadProfilePictureIfPresent(
  memberData: MemberDataSource,
  userId: string,
  dto: UpdateUserProfileDto,
  pictureBase64?: string,
  refData?: Record<string, KeyValue[]>,
): Observable<UpdateUserProfileDto> {
  if (!pictureBase64?.trim()) {
    return of(dto);
  }
  return memberData.uploadPicture(userId, pictureBase64, refData).pipe(
    map(pic => ({ ...dto, picture: pic.id })),
  );
}

export function saveMyProfileWithPicture(
  memberData: MemberDataSource,
  user: User,
  values: FormValues,
  pictureBase64?: string,
  refData?: Record<string, KeyValue[]>,
): Observable<User> {
  const dto = memberProfileFormValuesToUpdateDto(values, user, refData);
  return uploadProfilePictureIfPresent(memberData, user.id, dto, pictureBase64, refData).pipe(
    switchMap(body => memberData.updateMyProfile(body)),
    switchMap(() => memberData.getMyProfile()),
  );
}
