/**
 * Mapper functions to convert API Expense models to domain models
 */

import {
  ExpenseDetailDto,
  PagedResultExpenseDetailDto,
  ExpenseItemDetailDto
} from 'src/app/core/api-client/models';
import { Expense, ExpenseItem, PagedExpenses } from './expense.model';
import { mapAccountDtoToAccount } from './account.mapper';
import { mapPagedResult } from '../../../shared/model/paged-result.model';
import { date } from 'src/app/core/service/utilities.service';

/**
 * Map API ExpenseItemDetailDto to domain ExpenseItem
 */
function mapExpenseItem(dto: ExpenseItemDetailDto): ExpenseItem {
  return {
    itemName: dto.itemName,
    description: dto.description,
    amount: dto.amount,
    formattedAmount: `₹${dto.amount.toLocaleString('en-IN')}`
  };
}

/**
 * Get expense status label
 */
function getExpenseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'DRAFT': 'Draft',
    'SUBMITTED': 'Submitted',
    'FINALIZED': 'Finalized',
    'SETTLED': 'Settled',
    'REJECTED': 'Rejected'
  };
  return labels[status] || status;
}

/**
 * Map API ExpenseDetailDto to domain Expense
 */
export function mapExpenseDtoToExpense(dto: ExpenseDetailDto): Expense {
  const isSettled = dto.status === 'SETTLED';
  const isFinalized = dto.status === 'FINALIZED' || isSettled;
  const canEdit = dto.status === 'DRAFT' || dto.status === 'SUBMITTED';

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    expenseDate: dto.expenseDate,
    expenseRefId: dto.expenseRefId,
    expenseRefType: dto.expenseRefType,
    finalAmount: dto.finalAmount,
    status: dto.status,
    expenseItems: dto.expenseItems?.map(mapExpenseItem),
    settlementAccount: dto.settlementAccount ? mapAccountDtoToAccount(dto.settlementAccount) : undefined,
    txnNumber: dto.txnNumber,
    remarks: dto.remarks,
    isDeligated: dto.isDeligated,

    // User references
    createdBy: dto.createdBy ? {
      id: dto.createdBy.id,
      fullName: dto.createdBy.fullName,
      email: dto.createdBy.email
    } : undefined,
    paidBy: dto.paidBy ? {
      id: dto.paidBy.id,
      fullName: dto.paidBy.fullName,
      email: dto.paidBy.email
    } : undefined,
    finalizedBy: dto.finalizedBy ? {
      id: dto.finalizedBy.id,
      fullName: dto.finalizedBy.fullName,
      email: dto.finalizedBy.email
    } : undefined,
    settledBy: dto.settledBy ? {
      id: dto.settledBy.id,
      fullName: dto.settledBy.fullName,
      email: dto.settledBy.email
    } : undefined,
    rejectedBy: dto.rejectedBy ? {
      id: dto.rejectedBy.id,
      fullName: dto.rejectedBy.fullName,
      email: dto.rejectedBy.email
    } : undefined,

    // Dates
    createdOn: dto.createdOn,
    finalizedOn: dto.finalizedOn,
    settledOn: dto.settledOn,
    rejectedOn: dto.rejectedOn,

    // Computed properties
    displayName: dto.name,
    formattedAmount: `₹${dto.finalAmount.toLocaleString('en-IN')}`,
    formattedDate: date(dto.expenseDate, 'dd/MM/yyyy'),
    statusLabel: getExpenseStatusLabel(dto.status),
    isSettled,
    isFinalized,
    canEdit
  };
}

/**
 * Map API PagedResultExpenseDetailDto to domain PagedExpenses
 */
export function mapPagedExpenseDtoToPagedExpenses(dto: PagedResultExpenseDetailDto): PagedExpenses {
  return mapPagedResult(dto, mapExpenseDtoToExpense);
}

