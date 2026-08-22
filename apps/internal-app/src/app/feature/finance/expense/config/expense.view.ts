import type { ListRowItem, ListDetailSection } from '@nabarun-ngo/list-dashboard-core';
import {
  detailItemListSection,
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-angular';
import type { Doc } from 'src/app/shared/models/document.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date, isEmpty } from 'src/app/shared/utils/utilities.service';
import { AccountConstant } from '../../finance.const';
import type { Account } from '../../accounts/domain';
import type { Expense, ExpenseRefData, ExpenseStatus } from '../domain';

function refLabel(refData: ExpenseRefData, section: string, code?: string | null): string {
  if (!code) return '-';
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === code)?.displayValue ?? code;
}

function statusBadge(status: ExpenseStatus | undefined, statusLabel?: string) {
  switch (status) {
    case 'SETTLED':
      return { label: statusLabel ?? 'Reimbursed', tone: 'success' as const };
    case 'FINALIZED':
      return { label: statusLabel ?? 'Approved', tone: 'primary' as const };
    case 'SUBMITTED':
      return { label: statusLabel ?? 'Submitted', tone: 'warning' as const };
    case 'SEND_BACK':
      return { label: statusLabel ?? 'Sent back', tone: 'neutral' as const };
    case 'DRAFT':
      return { label: statusLabel ?? 'Not yet submitted', tone: 'neutral' as const };
    default:
      return { label: statusLabel ?? status ?? 'Unknown', tone: 'neutral' as const };
  }
}

function formatExpenseType(type: Expense['expenseRefType']): string {
  switch (type) {
    case 'EVENT': return 'Event';
    case 'OPERATIONAL': return 'Operational';
    case 'ADMINISTRATIVE': return 'Administrative';
    case 'ADHOC': return 'Ad hoc';
    case 'OTHER': return 'Other';
    default: return 'Expense';
  }
}

function iconToneForType(type: Expense['expenseRefType']) {
  switch (type) {
    case 'EVENT': return 'indigo' as const;
    case 'OPERATIONAL': return 'amber' as const;
    case 'ADMINISTRATIVE': return 'blue' as const;
    case 'ADHOC': return 'orange' as const;
    default: return 'neutral' as const;
  }
}

function formatAmount(expense: Expense): string {
  if (expense.formattedAmount) return expense.formattedAmount;
  if (expense.finalAmount != null) {
    return `₹${expense.finalAmount.toLocaleString('en-IN')}`;
  }
  return '—';
}

export function mapExpenseListRow(expense: Expense): ListRowItem<Expense> {
  const displayName = expense.displayName ?? expense.name ?? expense.id ?? 'Expense';
  return {
    id: expense.id ?? '',
    title: formatAmount(expense),
    subtitle: `${formatExpenseType(expense.expenseRefType)} · ${displayName}`,
    metaLeft: expense.paidBy?.fullName ?? undefined,
    metaRight: expense.formattedDate ?? expense.expenseDate ?? undefined,
    badge: statusBadge(expense.status, expense.statusLabel),
    icon: 'expense',
    iconTone: iconToneForType(expense.expenseRefType),
    payload: expense,
  };
}

function pushField(
  fields: ReturnType<typeof detailTextField>[],
  label: string,
  value: string | undefined | null,
  required = false,
): void {
  if (!required && (value === undefined || value === null || isEmpty(value))) return;
  fields.push(detailTextField(label, value ? String(value) : '-'));
}

export function buildExpenseDetailSections(
  expense: Expense,
  refData: ExpenseRefData,
  options?: { payerWallet?: Account },
): ListDetailSection[] {
  const sections: ListDetailSection[] = [];
  const detailFields: ReturnType<typeof detailTextField>[] = [];

  pushField(detailFields, 'Expense ID', expense.id, true);
  pushField(detailFields, 'Name', expense.name, true);
  pushField(
    detailFields,
    'Status',
    expense.statusLabel
      ?? refLabel(refData, AccountConstant.refDataKey.expenseStatus, expense.status),
    true,
  );
  pushField(
    detailFields,
    'Type',
    refLabel(refData, AccountConstant.refDataKey.expenseType, expense.expenseRefType),
    true,
  );
  pushField(
    detailFields,
    'Amount',
    expense.formattedAmount ?? expense.finalAmount?.toString(),
    true,
  );
  pushField(
    detailFields,
    'Expense date',
    expense.formattedDate ?? (expense.expenseDate ? date(expense.expenseDate) : undefined),
  );
  pushField(detailFields, 'Paid by', expense.paidBy?.fullName);
  pushField(detailFields, 'Description', expense.description);
  pushField(detailFields, 'Activity', expense.activityName);
  pushField(detailFields, 'Finalized by', expense.finalizedBy?.fullName);
  pushField(detailFields, 'Settled by', expense.settledBy?.fullName);
  pushField(detailFields, 'Sent back by', expense.sendBackBy?.fullName);
  pushField(
    detailFields,
    'Sent back on',
    expense.sendBackOn ? date(expense.sendBackOn) : undefined,
  );
  pushField(detailFields, 'Remarks', expense.remarks);

  sections.push(detailKeyValueSection('expense_detail', 'Expense details', detailFields));

  if (expense.expenseItems?.length) {
    sections.push(detailItemListSection(
      'expense_items',
      'Expense items',
      expense.expenseItems.map(item => ({
        id: item.itemName,
        title: item.itemName,
        metaRight: item.formattedAmount ?? String(item.amount),
      })),
    ));
  }

  const wallet = options?.payerWallet;
  if (expense.status === 'SUBMITTED' || expense.status === 'FINALIZED') {
    const settlementFields: ReturnType<typeof detailTextField>[] = [];
    const finalAmount = Number(expense.finalAmount ?? 0);
    const walletBalance = wallet?.balance ?? 0;
    pushField(settlementFields, 'Reimburse amount', expense.formattedAmount, true);
    pushField(settlementFields, 'Pay from wallet', wallet?.id);
    pushField(
      settlementFields,
      'Wallet balance',
      walletBalance ? `₹${walletBalance.toLocaleString('en-IN')}` : undefined,
    );
    if (wallet && walletBalance < finalAmount) {
      const shortfall = finalAmount - walletBalance;
      pushField(
        settlementFields,
        'Transfer needed',
        `₹${shortfall.toLocaleString('en-IN')} — use Top up wallet with transfer proof`,
      );
      pushField(settlementFields, 'Readiness', 'Top up the payer wallet, then reimburse');
    } else if (wallet) {
      pushField(settlementFields, 'Readiness', 'Ready to reimburse');
    } else if (expense.paidBy) {
      pushField(
        settlementFields,
        'Readiness',
        'Create a wallet for the payer to continue',
      );
    }
    sections.push(detailKeyValueSection('expense_settlement', 'Settlement', settlementFields));
  }

  return sections;
}

export const buildExpenseDocumentsLoading = (): ListDetailSection => ({
  type: 'documents',
  id: 'document_list',
  title: 'Documents',
  loading: true,
  documents: [],
});

export const buildExpenseDocuments = (documents: Doc[]): ListDetailSection => ({
  type: 'documents',
  id: 'document_list',
  title: 'Documents',
  loading: false,
  documents,
});
