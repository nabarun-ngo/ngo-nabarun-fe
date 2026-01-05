/**
 * Mapper functions to convert API Transaction models to domain models
 */

import {
  TransactionDetailDto,
  PagedResultTransactionDetailDto
} from 'src/app/core/api-client/models';
import { Transaction, PagedTransactions } from './transaction.model';
import { mapAccountDtoToAccount } from './account.mapper';
import { mapPagedResult } from '../../../shared/model/paged-result.model';
import { date } from 'src/app/core/service/utilities.service';

/**
 * Get transaction type label
 */
function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'IN': 'Money In',
    'OUT': 'Money Out',
    'TRANSFER': 'Transfer'
  };
  return labels[type] || type;
}

/**
 * Get transaction status label
 */
function getTransactionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'SUCCESS': 'Success',
    'FAILURE': 'Failed',
    'REVERT': 'Reverted'
  };
  return labels[status] || status;
}

/**
 * Map API TransactionDetailDto to domain Transaction
 */
export function mapTransactionDtoToTransaction(dto: TransactionDetailDto): Transaction {
  const isSuccess = dto.txnStatus === 'SUCCESS';
  const isTransfer = dto.txnType === 'TRANSFER';
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
    comment: dto.comment,

    // Account references
    transferFrom: dto.transferFrom,
    transferTo: dto.transferTo,
    accTxnType: dto.accTxnType,

    // Computed properties
    displayName: dto.txnDescription || dto.txnNumber || dto.txnId,
    formattedAmount,
    formattedDate: date(dto.txnDate, 'dd/MM/yyyy'),
    formattedBalance: dto.accBalance !== undefined ? `₹${dto.accBalance.toLocaleString('en-IN')}` : 'N/A',
    typeLabel: getTransactionTypeLabel(dto.txnType),
    statusLabel: getTransactionStatusLabel(dto.txnStatus),
    isSuccess,
    isTransfer,
    isIncoming,
    isOutgoing
  };
}

/**
 * Map API PagedResultTransactionDetailDto to domain PagedTransactions
 */
export function mapPagedTransactionDtoToPagedTransactions(dto: PagedResultTransactionDetailDto): PagedTransactions {
  return mapPagedResult(dto, mapTransactionDtoToTransaction);
}

