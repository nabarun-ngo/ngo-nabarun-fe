import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { BookDataSource } from '../data/book-data.source';
import type {
  Book,
  BookFilterCriteria,
  BookListContext,
  BookPrimaryChip,
  BookRefDataMap,
} from '../domain';
import {
  bookCreateEntity,
  bookCriteriaToValues,
  bookToUpdateValues,
  bookUpdatePatch,
  bookValuesToCriteria,
  buildBookCreateForm,
  buildBookEditSummary,
  buildBookFilterForm,
  buildBookUpdateForm,
  buildDonateOutBookForm,
  buildLendBookForm,
  buildMarkLostBookForm,
  buildReturnBookForm,
  buildRetireBookForm,
  buildTransferLocationForm,
  defaultBookCreateValues,
  defaultDonateOutBookValues,
  defaultLendBookValues,
  defaultMarkLostBookValues,
  defaultReturnBookValues,
  defaultRetireBookValues,
  defaultTransferLocationValues,
  donateOutBookPayload,
  lendBookPayload,
  markLostBookPayload,
  returnBookPayload,
  retireBookPayload,
  transferLocationPayload,
} from './book.forms';
import {
  BOOK_DEFAULT_CHIP,
  BOOK_LIST_CHIPS,
  buildBookAppliedFilters,
  canDonateOutBook,
  canLendBook,
  canMarkLostBook,
  canMoveLocation,
  canRetireBook,
  canReturnBook,
  cloneBookCriteria,
  countActiveBookSheetFilters,
  getDefaultCriteriaForChip,
  isBookPrimaryChip,
  normalizeBookChip,
  removeBookFilterById,
  resolveBookPermissions,
} from './book.rules';
import { buildBookDetailSections, mapBookToListRow } from './book.view';

export type BookListOperations = ListDashboardOperations & {
  deleteBook(book: Book): void;
};

export type BookListConfig = ListDashboardConfig<
  Book,
  BookFilterCriteria,
  BookListContext,
  BookListOperations
>;

const PAGE_SIZE = 12;

const BOOK_ROUTE_FILTER_BINDINGS = [
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'category', criteriaKey: 'category', type: 'string' as const },
  { param: 'author', criteriaKey: 'author', type: 'string' as const },
  { param: 'subject', criteriaKey: 'subject', type: 'string' as const },
  { param: 'classLevel', criteriaKey: 'classLevel', type: 'string' as const },
  { param: 'location', criteriaKey: 'location', type: 'string' as const },
  { param: 'holderUserId', criteriaKey: 'holderUserId', type: 'string' as const },
  { param: 'acquisitionType', criteriaKey: 'acquisitionType', type: 'string' as const },
];

export function createBookListConfig(deps: {
  data: BookDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: BookListContext;
  reloadList?: () => void;
}): BookListConfig {
  const labelMap = (options: { key: string; label: string }[]): ReadonlyMap<string, string> =>
    new Map(options.map(option => [option.key, option.label]));
  const userLabels = (): ReadonlyMap<string, string> => labelMap(deps.context.userOptions);

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...BOOK_LIST_CHIPS],
      defaultChip: BOOK_DEFAULT_CHIP,
      isValidChip: isBookPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: BOOK_DEFAULT_CHIP,
          normalize: chip => normalizeBookChip(chip),
        },
        filterBindings: BOOK_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneBookCriteria,
      getDefaultCriteriaForChip: chip => getDefaultCriteriaForChip(chip as BookPrimaryChip),
      buildFilterFormDefinition: (_chip, refData) =>
        buildBookFilterForm(refData as BookRefDataMap, {
          userOptions: deps.context.userOptions,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => bookCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        bookValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildBookAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveBookSheetFilters,
      removeFilterById: removeBookFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeBookChip(query.chipId),
        criteria: query.criteria as BookFilterCriteria,
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(book => mapBookToListRow(
            book,
            ctx.refData as BookRefDataMap,
            { users: userLabels() },
          )),
          totalSize: page.totalSize ?? 0,
          pageIndex: page.pageIndex ?? query.pageIndex,
          pageSize: page.pageSize ?? query.pageSize,
        })),
        catchError(() => of({
          items: [],
          totalSize: 0,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        })),
      ),
      mapToListRow: (book, ctx) => mapBookToListRow(
        book,
        ctx.refData as BookRefDataMap,
        { users: userLabels() },
      ),
    },
    detail: {
      getTitle: book => book.title,
      getEntityId: book => book.id,
      buildViewSections: (book, refData) => buildBookDetailSections(
        book,
        refData as BookRefDataMap,
        { users: userLabels() },
      ),
      fetchById: id => deps.data.fetchBookById(id).pipe(catchError(() => of(undefined))),
      findInList: (items, id) => items
        .map(item => item.payload as Book | undefined)
        .find(book => book?.id === id),
      primaryAction: {
        label: 'Update book',
        when: () => false,
      },
      edit: {
        buildEditSummary: context =>
          buildBookEditSummary(context.entity, context.refData as BookRefDataMap),
        buildEditForm: context =>
          buildBookUpdateForm(context.entity, context.refData as BookRefDataMap),
        entityToEditValues: bookToUpdateValues,
        refreshEditForm: context =>
          buildBookUpdateForm(context.entity, context.refData as BookRefDataMap),
        save: context => {
          const merged = { ...context.entity, ...bookUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateBook(context.entity.id, payload as Partial<Book>);
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData => buildBookCreateForm(refData as BookRefDataMap),
      defaultCreateValues: () => defaultBookCreateValues(),
      validateBeforeCreate: values => {
        if (!values['title']) {
          return 'Enter the book title.';
        }
        if (!values['author']) {
          return 'Enter the author.';
        }
        return undefined;
      },
      createSave: values => {
        if (!values['category']) {
          return throwError(() => new Error('Select a book category.'));
        }
        if (!values['subject']) {
          return throwError(() => new Error('Select a subject.'));
        }
        if (!values['classLevel']) {
          return throwError(() => new Error('Select a class level.'));
        }
        if (!values['acquisitionType']) {
          return throwError(() => new Error('Select an acquisition type.'));
        }
        return deps.data.createBook(bookCreateEntity(values));
      },
    },
    actionForms: {
      lend: {
        kind: 'form',
        title: book => `Lend ${book.title}`,
        saveLabel: 'Lend book',
        defaultValues: () => defaultLendBookValues(),
        buildForm: () => buildLendBookForm(deps.context.userOptions),
        save: context => deps.data.applyOperation(
          context.entity.id,
          lendBookPayload(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Book lent.',
        },
      },
      return: {
        kind: 'form',
        title: book => `Return ${book.title}`,
        saveLabel: 'Return book',
        defaultValues: () => defaultReturnBookValues(),
        buildForm: () => buildReturnBookForm(),
        save: context => deps.data.applyOperation(
          context.entity.id,
          returnBookPayload(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Book returned.',
        },
      },
      donateOut: {
        kind: 'form',
        title: book => `Donate out ${book.title}`,
        saveLabel: 'Donate out',
        defaultValues: () => defaultDonateOutBookValues(),
        buildForm: () => buildDonateOutBookForm(deps.context.userOptions),
        save: context => deps.data.applyOperation(
          context.entity.id,
          donateOutBookPayload(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Book donated out.',
        },
      },
      transferLocation: {
        kind: 'form',
        title: book => `Move ${book.title}`,
        saveLabel: 'Transfer location',
        defaultValues: entity => defaultTransferLocationValues(entity),
        buildForm: () => buildTransferLocationForm(),
        save: context => deps.data.applyOperation(
          context.entity.id,
          transferLocationPayload(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Location updated.',
        },
      },
      retire: {
        kind: 'form',
        title: book => `Retire ${book.title}`,
        saveLabel: 'Retire book',
        defaultValues: () => defaultRetireBookValues(),
        buildForm: () => buildRetireBookForm(),
        save: context => deps.data.applyOperation(
          context.entity.id,
          retireBookPayload(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Book retired.',
        },
      },
      markLost: {
        kind: 'form',
        title: book => `Mark lost — ${book.title}`,
        saveLabel: 'Mark lost',
        defaultValues: () => defaultMarkLostBookValues(),
        buildForm: () => buildMarkLostBookForm(),
        save: context => deps.data.applyOperation(
          context.entity.id,
          markLostBookPayload(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Book marked lost.',
        },
      },
    },
    operations: {
      deleteBook(book: Book) {
        deps.modal.openNotificationModal({
          title: 'Delete book?',
          description: `Delete "${book.title}"? This removes the book bank entry.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.deleteBook(book.id).subscribe({
            next: () => {
              deps.reloadList?.();
              deps.modal.openNotificationModal({
                title: 'Deleted',
                description: book.title,
              }, 'notification', 'success');
            },
            error: () => {
              deps.modal.openNotificationModal({
                title: 'Delete failed',
                description: 'Unable to delete this book.',
              }, 'notification', 'error');
            },
          });
        });
      },
    },
    meta: {
      id: 'book-list',
      title: 'Book',
      pageName: 'Library',
      searchPlaceholder: 'Search books',
      filterSheetTitle: 'Filter books',
      emptyMessage: 'No books match this filter.',
      detailRouteSync: { idParam: 'bookId' },
    },
    permissions: {
      resolve: () => resolveBookPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'bookOptions',
          cache: 'instance',
          run: async (context: BookListContext) => {
            const users = await firstValueFrom(
              deps.data.fetchUserOptions().pipe(catchError(() => of([]))),
            );
            context.userOptions = users;
            return { users };
          },
        },
      ],
      triggers: {
        init: ['bookOptions'],
        filterOpen: ['bookOptions'],
        createOpen: ['bookOptions'],
        editPrepare: ['bookOptions'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Register book',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'lend',
          label: 'Lend',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity
              && !!ctx.permissions['canOperate']
              && canLendBook(entity);
          },
          run: 'lend',
          actionFormId: 'lend',
        },
        {
          id: 'donateOut',
          label: 'Donate out',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity
              && !!ctx.permissions['canOperate']
              && canDonateOutBook(entity);
          },
          run: 'donateOut',
          actionFormId: 'donateOut',
        },
      ],
      detailMenu: [
        {
          id: 'update',
          label: 'Update book',
          when: ctx => !!ctx.permissions['canUpdateEntity'],
          run: 'openDetailEdit',
        },
        {
          id: 'return',
          label: 'Return',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity
              && !!ctx.permissions['canOperate']
              && canReturnBook(entity);
          },
          run: 'return',
          actionFormId: 'return',
        },
        {
          id: 'transferLocation',
          label: 'Move',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity
              && !!ctx.permissions['canOperate']
              && canMoveLocation(entity);
          },
          run: 'transferLocation',
          actionFormId: 'transferLocation',
        },
        {
          id: 'retire',
          label: 'Retire',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity
              && !!ctx.permissions['canOperate']
              && canRetireBook(entity);
          },
          run: 'retire',
          actionFormId: 'retire',
        },
        {
          id: 'markLost',
          label: 'Mark lost',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity
              && !!ctx.permissions['canOperate']
              && canMarkLostBook(entity);
          },
          run: 'markLost',
          actionFormId: 'markLost',
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: 'delete',
          when: ctx => {
            const entity = ctx.entity as Book | undefined;
            return !!entity && !!ctx.permissions['canDelete'];
          },
          run: 'deleteBook',
        },
      ],
    },
  };
}
