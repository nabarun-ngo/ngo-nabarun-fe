import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { toFieldOptions } from '@nabarun-ngo/forms-core';
import { catchError, firstValueFrom, from, map, of } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { DonationRefData as DonationRefDataKeys } from '../../finance.const';
import type { DonationDataSource } from '../data/donation-data.source';
import type {
  Donation,
  DonationFilterCriteria,
  DonationListContext,
  DonationPrimaryChip,
  DonationRefData,
} from '../domain';
import {
  buildDonationCreateStep,
  buildDonationFilterForm,
  buildDonationUpdateForm,
  DONATION_CREATE_STEPS,
  DONATION_PAYMENT_DOCUMENT_TYPES,
  donationCreateEntity,
  donationCriteriaToValues,
  donationRequiresPaymentProof,
  donationToUpdateValues,
  donationUpdatePatch,
  donationValuesToCriteria,
  saveDonationBulk,
  type DonationCreateStep,
  validateDonationCreateStep,
} from './donation.forms';
import {
  applyDonationProjectScope,
  DONATION_CHIPS,
  DONATION_DEFAULT_CHIP,
  donationStatusGroups,
  normalizeDonationChip,
  resolveDonationPermissions,
} from './donation.rules';
import {
  buildDonationDetailSections,
  buildDonationDocuments,
  buildDonationDocumentsLoading,
  mapDonationListRow,
} from './donation.view';

export type DonationListConfig = ListDashboardConfig<
  Donation,
  DonationFilterCriteria,
  DonationListContext,
  DonationListOperations
>;

export type DonationListOperations = {
  donationPayNowBulk(donations: readonly Donation[]): void;
  donationPayNow(donation: Donation): void;
  donation_donor(donation: Donation): void;
};

export function createDonationListConfig(deps: {
  data: DonationDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: DonationListContext;
  openDonor: (donation: Donation) => void;
}): DonationListConfig {
  const getAccounts = () => deps.context.payableAccountOptions;

  return {
    list: {
      pageSize: 12,
      chips: [...DONATION_CHIPS],
      defaultChip: DONATION_DEFAULT_CHIP,
      isValidChip: chip => DONATION_CHIPS.some(item => item.id === chip),
      route: {
        chipConfig: {
          defaultChip: DONATION_DEFAULT_CHIP,
          normalize: normalizeDonationChip,
        },
        filterBindings: [
          { param: 'donationStatus', criteriaKey: 'status', type: 'csv' },
          { param: 'donationType', criteriaKey: 'type', type: 'csv' },
          { param: 'filterDonationId', criteriaKey: 'donationId', type: 'string' },
          { param: 'donationStartDate', criteriaKey: 'startDate', type: 'string' },
          { param: 'donationEndDate', criteriaKey: 'endDate', type: 'string' },
          { param: 'donationMemberId', criteriaKey: 'memberId', type: 'string' },
          { param: 'donationGuestDonor', criteriaKey: 'guestDonor', type: 'boolean' },
          { param: 'forEventId', criteriaKey: 'forEventId', type: 'string' },
        ],
      },
      cloneCriteria: criteria => ({
        ...criteria,
        type: criteria.type ? [...criteria.type] : undefined,
        status: criteria.status ? [...criteria.status] : undefined,
      }),
      getDefaultCriteriaForChip: chip =>
        chip === 'mine' ? {} : { guestDonor: false },
      applyProjectEventScope: applyDonationProjectScope,
      buildFilterFormDefinition: (chip, refData, _criteria, context) =>
        buildDonationFilterForm(
          chip as DonationPrimaryChip,
          refData as DonationRefData,
          (context.asyncFilterOptions ?? []) as FieldOption[],
        ),
      criteriaToFilterFormValues: (_chip, criteria) => donationCriteriaToValues(criteria),
      filterFormValuesToCriteria: (chip, values, _criteria, context) =>
        donationValuesToCriteria(
          chip as DonationPrimaryChip,
          values,
          (context.asyncFilterOptions ?? []) as FieldOption[],
        ),
      buildAppliedFilters: criteria => [
        ...(criteria.memberId
          ? [{ id: 'donationDonor', label: `Donor: ${criteria.memberName ?? criteria.memberId}` }]
          : []),
        ...(criteria.type?.length
          ? [{ id: 'donationType', label: `Type: ${criteria.type.join(', ')}` }]
          : []),
        ...(criteria.status?.length
          ? [{ id: 'donationStatus', label: `Status: ${criteria.status.join(', ')}` }]
          : []),
        ...(criteria.donationId
          ? [{ id: 'donationId', label: `ID: ${criteria.donationId}` }]
          : []),
      ],
      countActiveSheetFilters: criteria => [
        criteria.memberId, criteria.type?.length, criteria.status?.length,
        criteria.donationId, criteria.startDate || criteria.endDate, criteria.guestDonor,
      ].filter(Boolean).length,
      removeFilterById: (criteria, id) => {
        const next = { ...criteria };
        if (id === 'donationDonor') {
          next.memberId = undefined;
          next.memberName = undefined;
        }
        if (id === 'donationType') next.type = undefined;
        if (id === 'donationStatus') next.status = undefined;
        if (id === 'donationId') next.donationId = undefined;
        return next;
      },
      loadPage: (query, context) => deps.data.loadDonationPage({
        ...query,
        chipId: normalizeDonationChip(query.chipId),
        criteria: query.criteria as DonationFilterCriteria,
        refData: context.refData as DonationRefData,
      }).pipe(
        map(result => ({
          items: (result.donations.content ?? []).map(item =>
            mapDonationListRow(item, context.refData as DonationRefData)),
          totalSize: result.donations.totalSize ?? 0,
          pageIndex: query.pageIndex,
          pageSize: 12,
        })),
        catchError(() => of({
          items: [], totalSize: 0, pageIndex: query.pageIndex, pageSize: 12,
        })),
      ),
      mapToListRow: (entity, ctx) =>
        mapDonationListRow(entity, ctx.refData as DonationRefData),
    },
    detail: {
      getTitle: donation => donation.id,
      buildViewSections: (donation, refData) =>
        buildDonationDetailSections(donation, refData as DonationRefData),
      documents: {
        buildLoadingSection: buildDonationDocumentsLoading,
        loadSection: id => deps.data.fetchDonationDocuments(id).pipe(
          map(buildDonationDocuments),
          catchError(() => of(buildDonationDocuments([]))),
        ),
      },
      fetchById: id => deps.data.fetchDonationById(id, 'all').pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Donation | undefined)
        .find(item => item?.id.toLowerCase() === id.toLowerCase()),
      primaryAction: {
        label: 'Edit',
        when: context => context.canUpdate()
          && context.activeChip() === 'all_outstanding',
      },
      edit: {
        documentTypes: DONATION_PAYMENT_DOCUMENT_TYPES,
        buildEditSummary: context => [
          { label: 'Donation number', value: context.entity.id },
          { label: 'Donor', value: context.entity.displayName },
          { label: 'Current status', value: context.entity.status },
        ],
        buildEditForm: context => buildDonationUpdateForm(
          context.entity, context.refData as DonationRefData, getAccounts(),
        ),
        entityToEditValues: donationToUpdateValues,
        refreshEditForm: context => buildDonationUpdateForm(
          context.entity, context.refData as DonationRefData, getAccounts(),
        ),
        onEditValuesChange: (context, values, setFormValue) => {
          const show = donationRequiresPaymentProof(
            values['status'], values['paymentMethod'],
            context.refData as DonationRefData,
          );
          // Cannot update amount and mark Paid in the same save.
          if (values['status'] === 'PAID' && values['amount'] !== context.entity.amount) {
            setFormValue?.('amount', context.entity.amount);
          }
          return { showDocumentUpload: show, clearDocuments: !show };
        },
        validateBeforeSave: context =>
          donationRequiresPaymentProof(
            context.values['status'], context.values['paymentMethod'],
            context.refData as DonationRefData,
          ) && !context.documents.length && !context.existingDocumentCount
            ? 'Please upload a payment proof (image or PDF).' : undefined,
        save: context => deps.data.updateDonation(
          context.entity.id,
          donationUpdatePatch(context.values),
          context.documents,
        ),
      },
    },
    create: {
      kind: 'stepper',
      route: {
        actionParam: 'donationCreate',
        presets: [
          { param: 'forEventId', stateKey: 'forEventId', type: 'string' },
          { param: 'projectLabel', stateKey: 'projectLabel', type: 'string' },
        ],
      },
      canOpen: runtime => runtime.activeChip === 'all_outstanding'
        && !!runtime.permissions['showCreateFab'],
      steps: DONATION_CREATE_STEPS,
      resolveSteps: () => ['donation_donor', 'donation_details'],
      defaultCreateValues: (_refData, presets) => ({
        donorId: '',
        donorIsGuest: 'N',
        type: null,
        donationFor: presets['forEventId'] ? 'PROJECT' : null,
        forEventId: presets['forEventId'] ?? null,
        amount: null,
        dateRange: {},
      }),
      buildStepDefinition: (step, _values, runtime) =>
        buildDonationCreateStep(
          step as DonationCreateStep,
          deps.context.refData,
          (runtime['createOptions'] as DonationListContext['createOptions'])
          ?? deps.context.createOptions,
        ),
      validateStep: (step, values, runtime) => validateDonationCreateStep(
        step as DonationCreateStep,
        values,
        (runtime['createOptions'] as DonationListContext['createOptions'])
        ?? deps.context.createOptions,
      ),
      createSave: (values, runtime) => {
        const options = (runtime?.['createOptions'] as DonationListContext['createOptions'])
          ?? deps.context.createOptions;
        const entity = donationCreateEntity(
          values, options, runtime?.presets['forEventId'] as string | undefined,
        );
        return deps.data.createDonation(entity, !!entity.isGuest);
      },
    },
    bulkEdit: {
      title: 'Bulk Update',
      when: context => context.activeChip === 'all_outstanding'
        && !!context.permissions['canUpdateEntity'],
      validateSelection: donations => {
        const error = validateDonationBulkSelection(donations);
        if (!error) return true;
        deps.modal.openNotificationModal(
          { title: 'Invalid selection', description: error },
          'notification', 'error'
        );
        return false;
      },
      buildEditSummary: donations => [
        { label: 'Items', value: `${donations.length} donation(s)` },
        { label: 'Donation IDs', value: donations.map(item => item.id).join(', ') },
      ],
      buildEditForm: (template, refData) =>
        buildDonationUpdateForm(template, refData as DonationRefData, getAccounts()),
      entityToEditValues: donationToUpdateValues,
      refreshEditForm: (template, refData) =>
        buildDonationUpdateForm(template, refData as DonationRefData, getAccounts()),
      onEditValuesChange: (template, values, setFormValue, refData) => {
        const show = donationRequiresPaymentProof(
          values['status'], values['paymentMethod'], refData as DonationRefData,
        );
        if (values['status'] === 'PAID' && values['amount'] !== template.amount) {
          setFormValue?.('amount', template.amount);
        }
        return { showDocumentUpload: show, clearDocuments: !show };
      },
      validateBeforeSave: (_template, values, documents, refData) =>
        donationRequiresPaymentProof(
          values['status'], values['paymentMethod'], refData as DonationRefData,
        ) && !documents.length
          ? 'Please upload a payment proof (image or PDF).' : undefined,
      documentTypes: DONATION_PAYMENT_DOCUMENT_TYPES,
      save: (donations, values, documents) =>
        from(saveDonationBulk(deps.data, donations, values, documents)),
    },
    operations: {
      donationPayNowBulk: donations => {
        const list = donations;
        const outstanding = new Set(donationStatusGroups(deps.context.refData).outstanding);
        const invalid = list.filter(item => !outstanding.has(item.status));
        if (!list.length || invalid.length) {
          deps.modal.openNotificationModal({
            title: 'Invalid selection',
            description: 'All selected donations must be outstanding.',
          }, 'notification', 'error', {
            copyableRefIds: invalid.map(item => item.id),
          });
          return;
        }
        deps.modal.openNotificationModal({
          title: 'Coming soon',
          description: 'Online payment is not available yet. This feature is coming soon.',
        }, 'notification', 'info');
      },
      donationPayNow: donation => {
        deps.modal.openNotificationModal({
          title: 'Coming soon',
          description: 'Online payment is not available yet. This feature is coming soon.',
        }, 'notification', 'info');
      },
      donation_donor: donation => deps.openDonor(donation),
    },
    meta: {
      id: 'donation-list',
      title: 'Donation',
      pageName: 'Donations',
      searchPlaceholder: 'Search donations…',
      filterSheetTitle: 'Filter donations',
      emptyMessage: 'No donations match this filter.',
      detailRouteSync: { idParam: 'donationId' },
    },
    permissions: { resolve: () => resolveDonationPermissions(deps.authorization) },
    behavior: {
      selectableWhen: context => context.activeChip === 'mine'
        || (context.activeChip === 'all_outstanding'
          && !!context.permissions['canUpdateEntity']),
      canUpdateEntity: context =>
        context.activeChip !== 'mine'
        && !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'donationDonorOptions',
          cache: 'instance',
          run: async (context: DonationListContext) => {
            const page = await firstValueFrom(deps.data.fetchDonationDonors());
            context.donors = page.content ?? [];
            context.donorOptions = context.donors.map(donor => ({
              key: donor.id,
              label: `${donor.fullName} ${donor.type === 'GUEST' ? '(Guest)' : ''}`,
            }));
            return context.donorOptions;
          },
        },
        {
          id: 'donationCreateOptions',
          dependsOn: ['donationDonorOptions'],
          cache: {
            policy: 'byInputs',
            inputs: (context: DonationListContext) => context.presets,
          },
          run: async (context: DonationListContext) => {
            const eventOptions = await firstValueFrom(deps.data.fetchDonationEvents());
            if (context.presets.forEventId
              && !eventOptions.some(option => option.key === context.presets.forEventId)) {
              eventOptions.unshift({
                key: context.presets.forEventId,
                label: context.presets.projectLabel ?? context.presets.forEventId,
              });
            }
            const allTypes = toFieldOptions(
              (context.refData[DonationRefDataKeys.refDataKey.type] as any[]) ?? [],
            );
            context.createOptions = {
              donors: context.donors,
              donorOptions: context.donorOptions,
              typeOptionsByDonor: Object.fromEntries(context.donors.map(donor => [
                donor.id,
                donor.type === 'GUEST'
                  ? allTypes.filter(type => type.key === 'ONETIME') : allTypes,
              ])),
              eventOptions,
              lockProjectDonation: !!context.presets.forEventId,
            };
            return context.createOptions;
          },
        },
        {
          id: 'donationPayableAccounts',
          cache: 'instance',
          run: async (context: DonationListContext) => {
            const accounts = await firstValueFrom(deps.data.fetchDonationAccounts());
            context.payableAccountOptions = accounts.map(account => ({
              key: account.id,
              label: account.displayName || account.accountHolderName || account.id,
            }));
            return context.payableAccountOptions;
          },
        },
      ],
      triggers: {
        init: [],
        filterOpen: ['donationDonorOptions'],
        createOpen: ['donationCreateOptions'],
        editPrepare: ['donationPayableAccounts'],
        bulkEdit: ['donationPayableAccounts'],
      },
    },
    actions: {
      bulk: [
        {
          id: 'payNow',
          label: 'Pay Now',
          appearance: 'primary',
          when: ctx => ctx.activeChip === 'mine',
          run: 'donationPayNowBulk',
        },
        {
          id: 'bulkUpdate',
          label: 'Bulk Update',
          appearance: 'primary',
          when: ctx => ctx.activeChip === 'all_outstanding',
          run: 'openBulkEdit',
        },
      ],
      detailFooter: [
        {
          id: 'payNowDetail',
          label: 'Pay Now',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Donation | undefined;
            const outstanding = new Set(
              donationStatusGroups(deps.context.refData).outstanding,
            );
            return ctx.activeChip === 'mine'
              && !!entity
              && outstanding.has(entity.status);
          },
          run: 'donationPayNow',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Add donation',
          appearance: 'fab',
          when: ctx => ctx.activeChip === 'all_outstanding'
            && !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}

function validateDonationBulkSelection(
  donations: readonly Donation[],
): string | undefined {
  if (!donations.length) return 'Select at least one donation.';
  if (new Set(donations.map(item => item.type)).size > 1) {
    return 'All donations must have the same type.';
  }
  if (new Set(donations.map(item => item.status)).size > 1) {
    return 'All donations must have the same status.';
  }
  if (new Set(donations.map(item => item.amount)).size > 1) {
    return 'All donations must have the same amount.';
  }
  return undefined;
}
