import { of } from 'rxjs';
import type {
  AccountService as AccountApiService,
  DmsService,
  ExpenseService as ExpenseApiService,
  ProjectService as ProjectApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import type {
  ExpenseDetailDto,
  SuccessResponseExpenseListResponseDto,
} from 'src/app/core/api/api-client/models';
import { ExpenseApiDataSource } from './expense-api.data-source';

describe('ExpenseApiDataSource', () => {
  const expenseDto: ExpenseDetailDto = {
    id: 'EXP-1',
    name: 'Project supplies',
    description: 'Supplies',
    expenseDate: '2026-09-26',
    expenseRefType: 'EVENT',
    expenseRefId: 'EVENT-1',
    finalAmount: 500,
    status: 'SUBMITTED',
    createdOn: '2026-09-26',
  };
  const response = (
    items: ExpenseDetailDto[],
    total: number,
    pageIndex: number,
    pageSize: number,
  ): SuccessResponseExpenseListResponseDto => ({
    info: '',
    message: '',
    timestamp: '',
    traceId: '',
    responsePayload: { items, total, pageIndex, pageSize },
  });
  let expenseApi: jasmine.SpyObj<ExpenseApiService>;
  let source: ExpenseApiDataSource;

  beforeEach(() => {
    expenseApi = jasmine.createSpyObj<ExpenseApiService>('ExpenseApiService', [
      'expenseControllerListExpenses',
      'expenseControllerListSelfExpenses',
    ]);
    source = new ExpenseApiDataSource(
      expenseApi,
      {} as AccountApiService,
      {} as DmsService,
      {} as UsersService,
      {} as ProjectApiService,
    );
  });

  it('forwards server paging and filters to the organization endpoint', (done) => {
    expenseApi.expenseControllerListExpenses.and.returnValue(
      of(response([expenseDto], 21, 2, 5)),
    );

    source.fetchExpenses({
      pageIndex: 2,
      pageSize: 5,
      filter: {
        expenseId: 'EXP-1',
        expenseStatus: ['SUBMITTED'],
      },
    }).subscribe(page => {
      expect(expenseApi.expenseControllerListExpenses).toHaveBeenCalledWith({
        pageIndex: 2,
        pageSize: 5,
        expenseId: 'EXP-1',
        expenseStatus: ['SUBMITTED'],
      });
      expect(page.totalSize).toBe(21);
      expect(page.pageIndex).toBe(2);
      expect(page.pageSize).toBe(5);
      done();
    });
  });

  it('applies expense type only as a client overlay', (done) => {
    expenseApi.expenseControllerListExpenses.and.returnValue(of(response([
      expenseDto,
      { ...expenseDto, id: 'EXP-2', expenseRefType: 'OTHER' },
    ], 2, 0, 12)));

    source.loadListPage({
      chipId: 'reimbursed',
      criteria: { expenseRefType: ['EVENT'] },
      pageIndex: 0,
      pageSize: 12,
      useOrgList: true,
    }).subscribe(page => {
      expect(page.content?.map(expense => expense.id)).toEqual(['EXP-1']);
      expect(page.totalSize).toBe(1);
      const params = expenseApi.expenseControllerListExpenses.calls.mostRecent().args[0];
      expect(params).not.toEqual(jasmine.objectContaining({ expenseRefType: jasmine.anything() }));
      done();
    });
  });
});
