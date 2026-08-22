import {
  ExpenseDetailDto,
  ExpenseListResponseDto,
  ExpenseItemDetailDto,
  ExpenseRefDataDto,
} from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { mapPagedResult } from 'src/app/shared/models/paged-result.model';
import { date } from 'src/app/shared/utils/utilities.service';
import { AccountConstant } from '../../finance.const';
import type {
  Expense,
  ExpenseItem,
  ExpenseRefData,
  ExpenseStatus,
  ExpenseStatusGroups,
  PagedExpenses,
} from '../domain';

function mapExpenseItem(dto: ExpenseItemDetailDto): ExpenseItem {
  return {
    itemName: dto.itemName,
    amount: dto.amount,
    formattedAmount: `₹${dto.amount.toLocaleString('en-IN')}`,
  };
}

function getExpenseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Not yet submitted',
    SUBMITTED: 'Submitted',
    FINALIZED: 'Approved',
    SETTLED: 'Reimbursed',
    SEND_BACK: 'Sent back',
  };
  return labels[status] || status;
}

export function mapExpenseDtoToExpense(dto: ExpenseDetailDto): Expense {
  const status = dto.status as ExpenseStatus;
  const isSettled = status === 'SETTLED';
  const isFinalized = status === 'FINALIZED' || isSettled;
  const canEdit = status === 'DRAFT' || status === 'SUBMITTED' || status === 'SEND_BACK';

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    expenseDate: dto.expenseDate,
    expenseRefId: dto.expenseRefId,
    expenseRefType: dto.expenseRefType,
    finalAmount: dto.finalAmount,
    status,
    expenseItems: dto.expenseItems?.map(mapExpenseItem),
    txnNumber: dto.txnNumber,
    remarks: dto.remarks,
    isDeligated: dto.isDeligated,
    settlementAccountId: dto.settlementAccountId,
    activityName: dto.activityName,
    createdBy: dto.createdBy
      ? { id: dto.createdBy.id, fullName: dto.createdBy.fullName, email: dto.createdBy.email }
      : undefined,
    paidBy: dto.paidBy
      ? { id: dto.paidBy.id, fullName: dto.paidBy.fullName, email: dto.paidBy.email }
      : undefined,
    finalizedBy: dto.finalizedBy
      ? { id: dto.finalizedBy.id, fullName: dto.finalizedBy.fullName, email: dto.finalizedBy.email }
      : undefined,
    settledBy: dto.settledBy
      ? { id: dto.settledBy.id, fullName: dto.settledBy.fullName, email: dto.settledBy.email }
      : undefined,
    sendBackBy: dto.sendBackBy
      ? { id: dto.sendBackBy.id, fullName: dto.sendBackBy.fullName, email: dto.sendBackBy.email }
      : undefined,
    createdOn: dto.createdOn,
    finalizedOn: dto.finalizedOn,
    settledOn: dto.settledOn,
    sendBackOn: dto.sendBackOn,
    displayName: dto.name,
    formattedAmount: `₹${dto.finalAmount.toLocaleString('en-IN')}`,
    formattedDate: date(dto.expenseDate, 'dd/MM/yyyy'),
    statusLabel: getExpenseStatusLabel(status),
    isSettled,
    isFinalized,
    canEdit,
  };
}

export function mapPagedExpenseDtoToPagedExpenses(dto: ExpenseListResponseDto): PagedExpenses {
  return mapPagedResult(dto, mapExpenseDtoToExpense);
}

type RefDataItem = { key?: string; value?: string; displayValue?: string };

function mapRefItems(items: RefDataItem[] | undefined): KeyValue[] {
  return (items ?? [])
    .filter(item => !!item.key)
    .map(item => ({
      key: item.key!,
      displayValue: item.displayValue ?? item.value ?? item.key!,
    }));
}

function mapStatusGroups(
  groups: ExpenseRefDataDto['expenseStatusGroups'] | undefined,
): ExpenseStatusGroups {
  return {
    outstanding: [...(groups?.outstanding ?? [])],
    closed: [...(groups?.closed ?? [])],
    excluded: [...(groups?.excluded ?? [])],
  };
}

/** Maps expense reference-data DTO keys to dashboard refData shape. */
export function mapExpenseRefData(dto?: ExpenseRefDataDto): ExpenseRefData {
  if (!dto) {
    return {};
  }
  const result: ExpenseRefData = {
    [AccountConstant.refDataKey.expenseStatus]: mapRefItems(dto.expenseStatuses as RefDataItem[]),
    [AccountConstant.refDataKey.expenseType]: mapRefItems(dto.expenseRefTypes as RefDataItem[]),
  };
  if (dto.expenseStatusGroups) {
    result[AccountConstant.refDataKey.expenseStatusGroups] = mapStatusGroups(dto.expenseStatusGroups);
  }
  return result;
}
