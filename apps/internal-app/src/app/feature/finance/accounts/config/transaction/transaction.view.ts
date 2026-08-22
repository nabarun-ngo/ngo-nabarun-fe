import type {
  ListDetailField,
  ListDetailSection,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import {
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-core';
import type { Doc } from 'src/app/shared/models/document.model';
import { date, isEmpty } from 'src/app/shared/utils/utilities.service';
import type { Transaction } from '../../domain';

function resolveTransactionBalance(transaction: Transaction): string | undefined {
  if (transaction.formattedBalance) {
    return transaction.formattedBalance;
  }
  if (transaction.accBalance !== undefined) {
    return `₹${transaction.accBalance.toLocaleString('en-IN')}`;
  }
  return undefined;
}

export function mapTransactionListRow(transaction: Transaction): ListRowItem<Transaction> {
  const balance = resolveTransactionBalance(transaction);
  const metaLeft = balance
    ? `${transaction.typeLabel} · Balance ${balance}`
    : transaction.typeLabel;

  return {
    id: transaction.txnId,
    title: transaction.formattedAmount,
    subtitle: transaction.txnDescription || transaction.displayName,
    metaLeft,
    metaRight: transaction.formattedDate,
    badge: {
      label: transaction.statusLabel,
      tone: transaction.isSuccess ? 'success' : 'neutral',
    },
    icon: transaction.isIncoming ? 'arrow-down' : 'arrow-up',
    iconTone: transaction.isIncoming ? 'green' : 'red',
    payload: transaction,
  };
}

function pushField(
  fields: ListDetailField[],
  label: string,
  value: string | undefined | null,
  options: { required?: boolean } = {},
): void {
  if (!options.required && (value === undefined || value === null || isEmpty(value))) {
    return;
  }
  fields.push(detailTextField(label, value ? String(value) : '-'));
}

export function buildTransactionListDetailSections(
  transaction: Transaction,
): ListDetailSection[] {
  const fields: ListDetailField[] = [];

  pushField(fields, 'Transaction Number', transaction.txnId, { required: true });
  pushField(fields, 'Transaction Reference Number', transaction.transactionRef, { required: true });
  pushField(fields, 'Transaction Type', transaction.txnType, { required: true });
  pushField(fields, 'Transaction Particulars', transaction.txnParticulars);
  pushField(fields, 'Transaction Description', transaction.txnDescription, { required: true });
  pushField(fields, 'Transaction Amount', transaction.formattedAmount, { required: true });
  pushField(
    fields,
    'Transaction Date',
    transaction.formattedDate ?? date(transaction.txnDate),
    { required: true },
  );
  pushField(
    fields,
    'Transaction Status',
    transaction.statusLabel ?? transaction.txnStatus,
    { required: true },
  );

  if (transaction.txnRefType === 'EXPENSE' && transaction.txnRefId) {
    pushField(fields, 'Linked Expense ID', transaction.txnRefId, { required: true });
  } else {
    pushField(fields, 'Transaction Ref Id', transaction.txnRefId);
    pushField(fields, 'Transaction Ref Type', transaction.txnRefType);
  }

  pushField(fields, 'Transfer From Account', transaction.transferFrom);
  pushField(fields, 'Transfer To Account', transaction.transferTo);
  pushField(fields, 'Balance After Transaction', transaction.formattedBalance, { required: true });
  pushField(fields, 'Remarks', transaction.comment);

  return [detailKeyValueSection('txn_det', 'Transaction details', fields)];
}

export function buildTransactionDocuments(documents: Doc[]): ListDetailSection {
  return {
    type: 'documents',
    id: 'document_list',
    title: 'Documents',
    documents,
  };
}

export function buildTransactionDocumentsLoading(): ListDetailSection {
  return {
    type: 'documents',
    id: 'document_list',
    title: 'Documents',
    documents: [],
    loading: true,
  };
}
