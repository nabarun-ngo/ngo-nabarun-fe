import { Account, PagedAccounts } from 'src/app/feature/finance/accounts/domain';
import type { PagedTransactions, Transaction, TransactionApiFilter } from 'src/app/feature/finance/accounts/domain';
import { AccountListFilter } from 'src/app/feature/finance/accounts/data/account-data.source';

function parseFilterDate(value?: string): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = new Date(value.trim());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function includesFilterValue(values: string | string[] | undefined, candidate: string): boolean {
  if (!values) {
    return true;
  }
  const list = Array.isArray(values) ? values : [values];
  return list.includes(candidate);
}

function transactionMatchesFilter(transaction: Transaction, filter?: TransactionApiFilter): boolean {
  if (!filter) {
    return true;
  }

  if (filter.transactionRef) {
    const needle = filter.transactionRef.toLowerCase();
    if (!transaction.transactionRef.toLowerCase().includes(needle)) {
      return false;
    }
  }

  if (filter.txnId) {
    const needle = filter.txnId.toLowerCase();
    if (!transaction.txnId.toLowerCase().includes(needle)) {
      return false;
    }
  }

  if (filter.txnType && !includesFilterValue(filter.txnType, transaction.txnType)) {
    return false;
  }

  if (filter.txnStatus && !includesFilterValue(filter.txnStatus, transaction.txnStatus)) {
    return false;
  }

  const txnDate = parseFilterDate(transaction.txnDate);
  const startDate = parseFilterDate(filter.startDate);
  const endDate = parseFilterDate(filter.endDate);

  if (startDate && txnDate && startOfDay(txnDate) < startOfDay(startDate)) {
    return false;
  }

  if (endDate && txnDate && startOfDay(txnDate) > startOfDay(endDate)) {
    return false;
  }

  return true;
}

export const DEMO_MINE_HOLDER_ID = 'user-demo-1';

export const DEMO_IFSC_LOOKUP: Record<string, { bankName: string; branch: string }> = {
  DEMO0000001: { bankName: 'Demo Bank', branch: 'Kolkata' },
  STDB0001234: { bankName: 'State Demo Bank', branch: 'Salt Lake' },
  DEMO0000002: { bankName: 'Demo Bank', branch: 'Park Street' },
  LEGY0000001: { bankName: 'Legacy Demo Bank', branch: 'Howrah' },
};

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc-wallet-001',
    accountType: 'WALLET',
    ownerType: 'INDIVIDUAL',
    status: 'ACTIVE',
    balance: 12500,
    accountHolderName: 'Demo Member',
    accountHolder: DEMO_MINE_HOLDER_ID,
    activatedOn: '2025-01-15T00:00:00.000Z',
    displayName: 'Wallet Account',
    isActive: true,
    formattedBalance: '₹12,500',
    accountTypeLabel: 'Wallet',
    ownerTypeLabel: 'Individual',
    upiDetails: [
      {
        id: 'upi-wallet-1',
        upiId: 'member@paytm',
        payeeName: 'Demo Member',
        mobileNumber: '+91 9000000001',
        isPrimary: true,
        displayName: 'member@paytm',
      },
    ],
  },
  {
    id: 'acc-wallet-002',
    accountType: 'WALLET',
    ownerType: 'INDIVIDUAL',
    status: 'ACTIVE',
    balance: 8700,
    accountHolderName: 'Event Coordinator',
    accountHolder: 'user-demo-2',
    activatedOn: '2025-03-01T00:00:00.000Z',
    displayName: 'Event Coordinator Wallet',
    isActive: true,
    formattedBalance: '₹8,700',
    accountTypeLabel: 'Wallet',
    ownerTypeLabel: 'Individual',
    upiDetails: [
      {
        id: 'upi-wallet-2',
        upiId: 'coordinator@upi',
        payeeName: 'Event Coordinator',
        mobileNumber: '+91 9000000012',
        isPrimary: true,
        displayName: 'coordinator@upi',
      },
    ],
  },
  {
    id: 'acc-wallet-003',
    accountType: 'WALLET',
    ownerType: 'INDIVIDUAL',
    status: 'ACTIVE',
    balance: 3200,
    accountHolderName: 'Volunteer Lead',
    accountHolder: 'user-demo-3',
    activatedOn: '2025-04-12T00:00:00.000Z',
    displayName: 'Volunteer Lead Wallet',
    isActive: true,
    formattedBalance: '₹3,200',
    accountTypeLabel: 'Wallet',
    ownerTypeLabel: 'Individual',
    upiDetails: [
      {
        id: 'upi-wallet-3',
        upiId: 'volunteer@oksbi',
        payeeName: 'Volunteer Lead',
        mobileNumber: '+91 9000000013',
        isPrimary: true,
        displayName: 'volunteer@oksbi',
      },
    ],
  },
  {
    id: 'acc-bank-ind-005',
    accountType: 'BANK',
    ownerType: 'INDIVIDUAL',
    status: 'ACTIVE',
    balance: 45200,
    accountHolderName: 'Demo Member',
    accountHolder: DEMO_MINE_HOLDER_ID,
    activatedOn: '2025-02-01T00:00:00.000Z',
    displayName: 'Individual Bank Account',
    isActive: true,
    formattedBalance: '₹45,200',
    accountTypeLabel: 'Bank Account',
    ownerTypeLabel: 'Individual',
    bankDetail: {
      accountNumber: '9876543210',
      accountHolderName: 'Demo Member',
      bankName: 'State Demo Bank',
      accountType: 'Savings',
      branch: 'Salt Lake',
      ifscNumber: 'STDB0001234',
      displayName: 'State Demo Bank · 3210',
      formattedAccountNumber: '****3210',
    },
    upiDetails: [
      {
        id: 'upi-bank-ind-1',
        upiId: 'demomember@okaxis',
        payeeName: 'Demo Member',
        mobileNumber: '+91 9000000001',
        isPrimary: true,
        displayName: 'demomember@okaxis',
      },
    ],
  },
  {
    id: 'acc-invest-ind-007',
    accountType: 'INVESTMENT',
    ownerType: 'INDIVIDUAL',
    status: 'ACTIVE',
    balance: 150000,
    accountHolderName: 'Demo Member',
    accountHolder: DEMO_MINE_HOLDER_ID,
    activatedOn: '2024-11-20T00:00:00.000Z',
    description: 'Personal fixed deposit for long-term savings',
    displayName: 'Individual FD Account',
    isActive: true,
    formattedBalance: '₹1,50,000',
    accountTypeLabel: 'Investment Account',
    ownerTypeLabel: 'Individual',
    bankDetail: {
      accountNumber: 'FD-IND-7788',
      bankName: 'Demo Finance Corp',
      accountType: 'FD',
      maturityDate: '2027-11-20',
      interestRate: 7.25,
      interestPayingTerm: 'QUARTERLY',
      displayName: 'Demo Finance Corp · FD-IND-7788',
      formattedAccountNumber: 'FD-IND-7788',
    },
  },
  {
    id: 'acc-bank-002',
    accountType: 'BANK',
    ownerType: 'ORG',
    status: 'ACTIVE',
    balance: 85000,
    accountHolderName: 'Nabarun',
    custodianUserIds: [DEMO_MINE_HOLDER_ID],
    activatedOn: '2024-06-01T00:00:00.000Z',
    displayName: 'Org Bank Account',
    isActive: true,
    formattedBalance: '₹85,000',
    accountTypeLabel: 'Bank Account',
    ownerTypeLabel: 'Organization',
    bankDetail: {
      accountNumber: '1234567890',
      accountHolderName: 'Nabarun',
      bankName: 'Demo Bank',
      accountType: 'Current',
      branch: 'Kolkata',
      ifscNumber: 'DEMO0000001',
      displayName: 'Demo Bank · 7890',
      formattedAccountNumber: '****7890',
    },
    upiDetails: [
      {
        id: 'upi-1',
        upiId: 'nabarun@okhdfc',
        payeeName: 'Nabarun',
        mobileNumber: '+91 9000000002',
        isPrimary: true,
        displayName: 'nabarun@okhdfc',
      },
      {
        id: 'upi-2',
        upiId: 'donations@okicici',
        payeeName: 'Nabarun Donations',
        mobileNumber: '+91 9000000003',
        label: 'Donations',
        displayName: 'donations@okicici',
      },
    ],
    upiDetail: {
      upiId: 'nabarun@okhdfc',
      payeeName: 'Nabarun',
      mobileNumber: '+91 9000000002',
      isPrimary: true,
      displayName: 'nabarun@okhdfc',
    },
  },
  {
    id: 'acc-invest-org-006',
    accountType: 'INVESTMENT',
    ownerType: 'ORG',
    status: 'ACTIVE',
    balance: 500000,
    accountHolderName: 'Nabarun',
    custodianUserIds: [DEMO_MINE_HOLDER_ID],
    activatedOn: '2024-04-15T00:00:00.000Z',
    description: 'Organization mutual fund corpus for program reserves',
    displayName: 'Org Mutual Fund Account',
    isActive: true,
    formattedBalance: '₹5,00,000',
    accountTypeLabel: 'Investment Account',
    ownerTypeLabel: 'Organization',
    bankDetail: {
      accountNumber: 'MF-ORG-4421',
      bankName: 'Demo AMC',
      accountType: 'MF',
      dematId: 'IN30012345678901',
      interestRate: 11.5,
      interestPayingTerm: 'YEARLY',
      maturityDate: '2029-04-15',
      displayName: 'Demo AMC · MF-ORG-4421',
      formattedAccountNumber: 'MF-ORG-4421',
    },
  },
  {
    id: 'acc-blocked-003',
    accountType: 'BANK',
    ownerType: 'INDIVIDUAL',
    status: 'BLOCKED',
    balance: 3200,
    accountHolderName: 'Demo Member',
    accountHolder: DEMO_MINE_HOLDER_ID,
    activatedOn: '2024-09-10T00:00:00.000Z',
    displayName: 'Blocked Bank Account',
    isActive: false,
    formattedBalance: '₹3,200',
    accountTypeLabel: 'Bank Account',
    ownerTypeLabel: 'Individual',
    bankDetail: {
      accountNumber: '5555666677',
      accountHolderName: 'Demo Member',
      bankName: 'Demo Bank',
      accountType: 'Savings',
      branch: 'Park Street',
      ifscNumber: 'DEMO0000002',
      displayName: 'Demo Bank · 6677',
      formattedAccountNumber: '****6677',
    },
  },
  {
    id: 'acc-closed-004',
    accountType: 'WALLET',
    ownerType: 'INDIVIDUAL',
    status: 'CLOSED',
    balance: 0,
    accountHolderName: 'Demo Member',
    accountHolder: DEMO_MINE_HOLDER_ID,
    activatedOn: '2024-03-01T00:00:00.000Z',
    displayName: 'Closed Wallet',
    isActive: false,
    formattedBalance: '₹0',
    accountTypeLabel: 'Wallet',
    ownerTypeLabel: 'Individual',
  },
  {
    id: 'acc-bank-org-closed-008',
    accountType: 'BANK',
    ownerType: 'ORG',
    status: 'CLOSED',
    balance: 0,
    accountHolderName: 'Nabarun',
    custodianUserIds: [DEMO_MINE_HOLDER_ID],
    activatedOn: '2023-01-10T00:00:00.000Z',
    displayName: 'Closed Org Bank Account',
    isActive: false,
    formattedBalance: '₹0',
    accountTypeLabel: 'Bank Account',
    ownerTypeLabel: 'Organization',
    bankDetail: {
      accountNumber: '1111222233',
      accountHolderName: 'Nabarun',
      bankName: 'Legacy Demo Bank',
      accountType: 'Current',
      branch: 'Howrah',
      ifscNumber: 'LEGY0000001',
      displayName: 'Legacy Demo Bank · 2233',
      formattedAccountNumber: '****2233',
    },
  },
  {
    id: 'acc-invest-org-closed-009',
    accountType: 'INVESTMENT',
    ownerType: 'ORG',
    status: 'CLOSED',
    balance: 0,
    accountHolderName: 'Nabarun',
    custodianUserIds: [DEMO_MINE_HOLDER_ID],
    activatedOn: '2022-08-01T00:00:00.000Z',
    description: 'Closed PPF account — matured and withdrawn',
    displayName: 'Closed Org PPF Account',
    isActive: false,
    formattedBalance: '₹0',
    accountTypeLabel: 'Investment Account',
    ownerTypeLabel: 'Organization',
    bankDetail: {
      accountNumber: 'PPF-ORG-9900',
      bankName: 'Post Office Demo',
      accountType: 'PPF',
      maturityDate: '2022-08-01',
      displayName: 'Post Office Demo · PPF-ORG-9900',
      formattedAccountNumber: 'PPF-ORG-9900',
    },
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    txnId: 'txn-wallet-001',
    txnNumber: 'TXN-W001',
    transactionRef: 'ref-txn-wallet-001',
    txnDate: '2026-03-10T10:00:00.000Z',
    txnType: 'IN',
    txnStatus: 'SUCCESS',
    txnAmount: 5000,
    txnDescription: 'Expense reimbursement',
    txnRefId: 'exp-demo-001',
    txnRefType: 'EXPENSE',
    accBalance: 12500,
    displayName: 'Expense reimbursement',
    formattedAmount: '+₹5,000',
    formattedDate: '10/03/2026',
    formattedBalance: '₹12,500',
    typeLabel: 'Money In',
    statusLabel: 'Success',
    isSuccess: true,
    isTransfer: false,
    isIncoming: true,
    isOutgoing: false,
  },
  {
    txnId: 'txn-wallet-002',
    txnNumber: 'TXN-W002',
    transactionRef: 'ref-txn-wallet-002',
    txnDate: '2026-03-05T14:30:00.000Z',
    txnType: 'OUT',
    txnStatus: 'SUCCESS',
    txnAmount: 2500,
    txnDescription: 'Transfer to org bank account',
    transferTo: 'acc-bank-002',
    accBalance: 7500,
    displayName: 'Transfer to org bank account',
    formattedAmount: '-₹2,500',
    formattedDate: '05/03/2026',
    formattedBalance: '₹7,500',
    typeLabel: 'Money Out',
    statusLabel: 'Success',
    isSuccess: true,
    isTransfer: true,
    isIncoming: false,
    isOutgoing: true,
  },
  {
    txnId: 'txn-bank-ind-001',
    txnNumber: 'TXN-BI001',
    transactionRef: 'ref-txn-bank-ind-001',
    txnDate: '2026-03-08T09:15:00.000Z',
    txnType: 'IN',
    txnStatus: 'SUCCESS',
    txnAmount: 12000,
    txnDescription: 'Salary credit',
    accBalance: 45200,
    displayName: 'Salary credit',
    formattedAmount: '+₹12,000',
    formattedDate: '08/03/2026',
    formattedBalance: '₹45,200',
    typeLabel: 'Money In',
    statusLabel: 'Success',
    isSuccess: true,
    isTransfer: false,
    isIncoming: true,
    isOutgoing: false,
  },
  {
    txnId: 'txn-bank-org-001',
    txnNumber: 'TXN-BO001',
    transactionRef: 'ref-txn-bank-org-001',
    txnDate: '2026-03-01T11:00:00.000Z',
    txnType: 'IN',
    txnStatus: 'SUCCESS',
    txnAmount: 25000,
    txnDescription: 'Donation collection transfer',
    txnRefId: 'don-demo-001',
    txnRefType: 'DONATION',
    accBalance: 85000,
    displayName: 'Donation collection transfer',
    formattedAmount: '+₹25,000',
    formattedDate: '01/03/2026',
    formattedBalance: '₹85,000',
    typeLabel: 'Money In',
    statusLabel: 'Success',
    isSuccess: true,
    isTransfer: false,
    isIncoming: true,
    isOutgoing: false,
  },
  {
    txnId: 'txn-invest-ind-001',
    txnNumber: 'TXN-II001',
    transactionRef: 'ref-txn-invest-ind-001',
    txnDate: '2026-01-01T00:00:00.000Z',
    txnType: 'IN',
    txnStatus: 'SUCCESS',
    txnAmount: 2500,
    txnDescription: 'Quarterly FD interest',
    txnRefType: 'EARNING',
    accBalance: 150000,
    displayName: 'Quarterly FD interest',
    formattedAmount: '+₹2,500',
    formattedDate: '01/01/2026',
    formattedBalance: '₹1,50,000',
    typeLabel: 'Money In',
    statusLabel: 'Success',
    isSuccess: true,
    isTransfer: false,
    isIncoming: true,
    isOutgoing: false,
  },
  {
    txnId: 'txn-invest-org-001',
    txnNumber: 'TXN-IO001',
    transactionRef: 'ref-txn-invest-org-001',
    txnDate: '2026-02-28T00:00:00.000Z',
    txnType: 'IN',
    txnStatus: 'SUCCESS',
    txnAmount: 15000,
    txnDescription: 'Annual MF dividend',
    txnRefType: 'EARNING',
    accBalance: 500000,
    displayName: 'Annual MF dividend',
    formattedAmount: '+₹15,000',
    formattedDate: '28/02/2026',
    formattedBalance: '₹5,00,000',
    typeLabel: 'Money In',
    statusLabel: 'Success',
    isSuccess: true,
    isTransfer: false,
    isIncoming: true,
    isOutgoing: false,
  },
];

const DEMO_TRANSACTIONS_BY_ACCOUNT: Record<string, Transaction[]> = {
  'acc-wallet-001': DEMO_TRANSACTIONS.filter(txn => txn.txnId.startsWith('txn-wallet-')),
  'acc-bank-ind-005': DEMO_TRANSACTIONS.filter(txn => txn.txnId.startsWith('txn-bank-ind-')),
  'acc-bank-002': DEMO_TRANSACTIONS.filter(txn => txn.txnId.startsWith('txn-bank-org-')),
  'acc-invest-ind-007': DEMO_TRANSACTIONS.filter(txn => txn.txnId.startsWith('txn-invest-ind-')),
  'acc-invest-org-006': DEMO_TRANSACTIONS.filter(txn => txn.txnId.startsWith('txn-invest-org-')),
};

function filterAccounts(filter?: AccountListFilter, mineOnly = false): Account[] {
  let rows = [...DEMO_ACCOUNTS];
  if (mineOnly) {
    rows = rows.filter(a => a.accountHolder === DEMO_MINE_HOLDER_ID);
  }
  if (filter?.accountId) {
    rows = rows.filter(a => a.id.toLowerCase().includes(filter.accountId!.toLowerCase()));
  }
  if (filter?.type?.length) {
    rows = rows.filter(a => filter.type!.includes(a.accountType));
  }
  if (filter?.ownerType?.length) {
    rows = rows.filter(a => a.ownerType && filter.ownerType!.includes(a.ownerType));
  }
  if (filter?.status?.length) {
    rows = rows.filter(a => filter.status!.includes(a.status));
  }
  if (filter?.accountHolderId) {
    rows = rows.filter(a => a.accountHolder === filter.accountHolderId);
  }
  return rows;
}

export function pageDemoAccounts(
  pageIndex: number,
  pageSize: number,
  filter?: AccountListFilter,
  mineOnly = false,
): PagedAccounts {
  const content = filterAccounts(filter, mineOnly);
  const start = pageIndex * pageSize;
  return {
    content: content.slice(start, start + pageSize),
    totalSize: content.length,
    pageIndex,
    pageSize,
  };
}

export function pageDemoTransactions(
  accountId: string,
  pageIndex: number,
  pageSize: number,
  filter?: TransactionApiFilter,
): PagedTransactions {
  const rows = (DEMO_TRANSACTIONS_BY_ACCOUNT[accountId] ?? [])
    .filter(transaction => transactionMatchesFilter(transaction, filter));
  const start = pageIndex * pageSize;
  return {
    content: rows.slice(start, start + pageSize),
    totalSize: rows.length,
    pageIndex,
    pageSize,
  };
}

export function findDemoAccountById(accountId: string): Account | undefined {
  return DEMO_ACCOUNTS.find(a => a.id === accountId);
}
