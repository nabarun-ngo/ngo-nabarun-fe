import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, map, of } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import type { DonorDataSource } from '../data/donor-data.source';
import type {
  Donor,
  DonorListCriteria,
  DonorPrimaryChip,
  DonorRefData,
  MergeGuestDonorsRequest,
} from '../domain';
import {
  buildDonorFilterForm,
  buildDonorGuestCreateForm,
  buildDonorGuestEditSummary,
  buildDonorGuestUpdateForm,
  buildDonorMemberEditSummary,
  buildDonorMemberUpdateForm,
  defaultDonorGuestCreateValues,
  donorCriteriaToValues,
  donorToGuestUpdateValues,
  donorToMemberUpdateValues,
  donorValuesToCriteria,
  guestCreateValuesToRequest,
  guestUpdateValuesToPatch,
  isMemberDonor,
  memberUpdateValuesToPatch,
  validateDonorMemberUpdate,
} from './donor.forms';
import {
  buildDonorAppliedFilters,
  countActiveDonorSheetFilters,
  DONOR_CHIPS,
  DONOR_DEFAULT_CHIP,
  isDonorPrimaryChip,
  isGuestChip,
  isMemberChip,
  normalizeDonorChip,
  removeDonorFilterById,
  resolveDonorPermissions,
  validateGuestMergeSelection,
} from './donor.rules';
import { buildDonorListDetailSections, mapDonorListRow } from './donor.view';

export type DonorListConfig = ListDashboardConfig<
  Donor,
  DonorListCriteria,
  void,
  DonorListOperations
>;

export type DonorListOperations = {
  openMergeGuests(donors: readonly Donor[]): void;
  mergeGuests(request: MergeGuestDonorsRequest): ReturnType<DonorDataSource['mergeGuestDonors']>;
};

const MOBILE_PAGE_SIZE = 12;

export function createDonorListConfig(deps: {
  data: DonorDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  openMerge: (donors: Donor[]) => void;
}): DonorListConfig {
  return {
    list: {
      pageSize: MOBILE_PAGE_SIZE,
      chips: [...DONOR_CHIPS],
      defaultChip: DONOR_DEFAULT_CHIP,
      isValidChip: isDonorPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: DONOR_DEFAULT_CHIP,
          normalize: normalizeDonorChip,
        },
        filterBindings: [
          { param: 'status', criteriaKey: 'status', type: 'string' },
        ],
      },
      cloneCriteria: criteria => ({ ...criteria }),
      getDefaultCriteriaForChip: () => ({}),
      buildFilterFormDefinition: (chip, refData) =>
        buildDonorFilterForm(chip as DonorPrimaryChip, refData as DonorRefData),
      criteriaToFilterFormValues: (_chip, criteria) => donorCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        donorValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildDonorAppliedFilters(criteria, refData),
      countActiveSheetFilters: countActiveDonorSheetFilters,
      removeFilterById: removeDonorFilterById,
      loadPage: (query, context) => {
        const chipId = normalizeDonorChip(query.chipId);
        return deps.data.loadListPage({
          chipId,
          criteria: query.criteria as DonorListCriteria,
          searchText: query.searchText,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        }).pipe(
          map(page => ({
            items: (page.content ?? []).map(donor =>
              mapDonorListRow(donor, context.refData as DonorRefData)),
            totalSize: page.totalSize ?? 0,
            pageIndex: query.pageIndex,
            pageSize: query.pageSize,
          })),
          catchError(() => of({
            items: [],
            totalSize: 0,
            pageIndex: query.pageIndex,
            pageSize: MOBILE_PAGE_SIZE,
          })),
        );
      },
      mapToListRow: (entity, ctx) =>
        mapDonorListRow(entity, ctx.refData as DonorRefData),
    },
    detail: {
      getTitle: donor => donor.fullName ?? donor.id,
      getEntityId: donor => donor.id,
      buildViewSections: (donor, refData) =>
        buildDonorListDetailSections(donor, refData as DonorRefData),
      fetchById: id => deps.data.fetchDonorById(id).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Donor | undefined)
        .find(donor => donor?.id?.toLowerCase() === id.toLowerCase()),
      primaryAction: {
        label: 'Edit',
        when: ctx => {
          if (!ctx.canUpdate()) return false;
          const chip = ctx.activeChip() as DonorPrimaryChip;
          return isGuestChip(chip) || isMemberChip(chip);
        },
      },
      edit: {
        buildEditSummary: ctx => isMemberDonor(ctx.entity)
          ? buildDonorMemberEditSummary(ctx.entity, ctx.refData as DonorRefData)
          : buildDonorGuestEditSummary(ctx.entity, ctx.refData as DonorRefData),
        buildEditForm: ctx => isMemberDonor(ctx.entity)
          ? buildDonorMemberUpdateForm(ctx.refData as DonorRefData)
          : buildDonorGuestUpdateForm(),
        entityToEditValues: entity => isMemberDonor(entity)
          ? donorToMemberUpdateValues(entity)
          : donorToGuestUpdateValues(entity),
        onEditValuesChange: (_ctx, values, setFormValue) => {
          if (values['status'] === 'ACTIVE' && setFormValue) {
            setFormValue('statusEndDate', '');
          }
        },
        validateBeforeSave: ctx => isMemberDonor(ctx.entity)
          ? validateDonorMemberUpdate(ctx.values, ctx.refData as DonorRefData)
          : undefined,
        save: ctx => {
          if (isMemberDonor(ctx.entity)) {
            return deps.data.updateMemberDonor(
              ctx.entity.id,
              memberUpdateValuesToPatch(ctx.values, ctx.refData as DonorRefData),
            );
          }
          return deps.data.updateGuestDonor(
            ctx.entity.id,
            guestUpdateValuesToPatch(ctx.values),
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: ctx => isGuestChip(ctx.activeChip as DonorPrimaryChip)
        && !!ctx.permissions['showCreateFab'],
      buildCreateForm: () => buildDonorGuestCreateForm(),
      defaultCreateValues: () => defaultDonorGuestCreateValues(),
      createSave: values =>
        deps.data.createGuestDonor(guestCreateValuesToRequest(values)),
    },
    operations: {
      openMergeGuests: donors => {
        const list = Array.isArray(donors) ? donors : [donors];
        const error = validateGuestMergeSelection(list);
        if (error) {
          deps.modal.openNotificationModal({
            title: list.length !== 2 ? 'Select two donors' : 'Cannot merge donors',
            description: error,
          }, 'notification', 'error');
          return;
        }
        deps.openMerge([...list]);
      },
      mergeGuests: request => deps.data.mergeGuestDonors(request),
    },
    meta: {
      id: 'finance.donors',
      title: 'Donor',
      pageName: 'Donors',
      searchPlaceholder: 'Search by name, email, or phone',
      filterSheetTitle: 'Donor Filters',
      emptyMessage: 'No donors match this filter.',
      detailRouteSync: { idParam: 'donorId', idParamAliases: ['id'] },
    },
    permissions: {
      resolve: () => resolveDonorPermissions(deps.authorization),
    },
    behavior: {
      selectableWhen: ctx => isGuestChip(ctx.activeChip as DonorPrimaryChip)
        && !!ctx.permissions['canMergeGuest'],
      canUpdateEntity: ctx => {
        const perms = resolveDonorPermissions(deps.authorization);
        if (isGuestChip(ctx.activeChip as DonorPrimaryChip)) {
          return !!perms.canUpdateGuest;
        }
        return isMemberChip(ctx.activeChip as DonorPrimaryChip) && !!perms.canUpdateMember;
      },
    },
    actions: {
      bulk: [
        {
          id: 'mergeGuests',
          label: 'Merge Donors',
          appearance: 'primary',
          when: ctx => ctx.activeChip === 'guest'
            && !!ctx.permissions['canMergeGuest'],
          run: 'openMergeGuests',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Create guest donor',
          appearance: 'fab',
          icon: 'add',
          when: ctx => ctx.activeChip === 'guest'
            && !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}
