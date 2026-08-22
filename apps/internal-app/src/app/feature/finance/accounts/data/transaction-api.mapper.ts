import {
  TransactionDetailDto,
  TransactionListResponseDto,
} from 'src/app/core/api/api-client/models';
import { mapPagedResult } from 'src/app/shared/models/paged-result.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { PagedTransactions, Transaction } from '../domain';

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    IN: 'Money In',
    OUT: 'Money Out',
    TRANSFER: 'Transfer',
  };
  return labels[type] || type;
}

function getTransactionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SUCCESS: 'Success',
    FAILURE: 'Failed',
    REVERT: 'Reverted',
    REVERSED: 'Reversed',
  };
  return labels[status] || status;
}

export function mapTransactionDtoToTransaction(dto: TransactionDetailDto): Transaction {
  const isSuccess = dto.txnStatus === 'SUCCESS';
  const isIncoming = dto.txnType === 'IN';
  const isOutgoing = dto.txnType === 'OUT';
  const amount = Math.abs(dto.txnAmount);
  const formattedAmount = isIncoming
    ? `+₹${amount.toLocaleString('en-IN')}`
    : isOutgoing
      ? `-₹${amount.toLocaleString('en-IN')}`
      : `₹${amount.toLocaleString('en-IN')}`;

  return {
    txnId: dto.txnId,
    txnNumber: dto.txnNumber,
    txnDate: dto.txnDate,
    txnType: dto.txnType,
    txnStatus: dto.txnStatus,
    txnAmount: dto.txnAmount,
    txnDescription: dto.txnDescription,
    txnParticulars: dto.txnParticulars,
    txnRefId: dto.txnRefId,
    txnRefType: dto.txnRefType,
    accBalance: dto.accBalance,
    isTransfer: false,
    transactionRef: dto.transactionRef,
    transferFrom: dto.transferFrom,
    transferTo: dto.transferTo,
    accTxnType: dto.accTxnType,
    displayName: dto.txnDescription || dto.txnNumber || dto.txnId,
    formattedAmount,
    formattedDate: date(dto.txnDate, 'dd/MM/yyyy'),
    formattedBalance: dto.accBalance !== undefined
      ? `₹${dto.accBalance.toLocaleString('en-IN')}`
      : 'N/A',
    typeLabel: getTransactionTypeLabel(dto.txnType),
    statusLabel: getTransactionStatusLabel(dto.txnStatus),
    isSuccess,
    isIncoming,
    isOutgoing,
  };
}

export function mapPagedTransactionDtoToPagedTransactions(
  dto: TransactionListResponseDto,
): PagedTransactions {
  return mapPagedResult(dto, mapTransactionDtoToTransaction);
}
