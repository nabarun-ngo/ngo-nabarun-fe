import { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { ExpenseApiDataSource } from './api/expense-api.data-source';
import { ExpenseDemoDataSource } from 'src/demo/finance/expense/expense-demo.data-source';
import { ExpenseDataSource } from './expense-data.source';

/** Expense infrastructure bindings — reads MOCK_DATA once at module level. */
export function provideExpenseDataSource(): Provider[] {
  if (MOCK_DATA) {
    return [
      ExpenseDemoDataSource,
      { provide: ExpenseDataSource, useExisting: ExpenseDemoDataSource },
    ];
  }

  return [
    ExpenseApiDataSource,
    { provide: ExpenseDataSource, useExisting: ExpenseApiDataSource },
  ];
}
