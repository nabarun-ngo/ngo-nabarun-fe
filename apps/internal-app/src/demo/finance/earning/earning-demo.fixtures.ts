import { earningStatusesForChip } from 'src/app/feature/finance/earning/config/earning.rules';
import type {
  Earning,
  EarningFilterCriteria,
  EarningPrimaryChip,
  EarningRefDataMap,
} from 'src/app/feature/finance/earning/domain';

export const DEMO_EARNING_REF_DATA = {
  earningCategories: [
    { key: 'INTEREST', displayValue: 'Interest' },
    { key: 'SERVICE', displayValue: 'Service' },
    { key: 'GRANT', displayValue: 'Grant' },
    { key: 'OTHER', displayValue: 'Other' },
  ],
  earningStatuses: [
    { key: 'PENDING', displayValue: 'Pending' },
    { key: 'RECEIVED', displayValue: 'Received' },
    { key: 'CANCELLED', displayValue: 'Cancelled' },
  ],
  earningStatusGroups: {
    outstanding: ['PENDING'],
    closed: ['RECEIVED', 'CANCELLED'],
    excluded: [] as string[],
  },
};

const DEMO_EARNINGS: Earning[] = [
  {
    id: 'earn-demo-1',
    source: 'HDFC Bank',
    category: 'INTEREST',
    amount: 12500,
    currency: 'INR',
    description: 'Quarterly interest',
    status: 'PENDING',
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'earn-demo-2',
    source: 'Annual Fundraiser',
    category: 'GRANT',
    amount: 50000,
    currency: 'INR',
    description: 'Community grant',
    status: 'RECEIVED',
    earningDate: '2026-02-01T00:00:00.000Z',
    receivedDate: '2026-02-03T11:00:00.000Z',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'earn-demo-3',
    source: 'Workshop fees',
    category: 'SERVICE',
    amount: 8000,
    currency: 'INR',
    description: 'Cancelled workshop',
    status: 'CANCELLED',
    createdAt: '2025-12-10T09:00:00.000Z',
  },
];

function matchesChip(
  earning: Earning,
  chipId: EarningPrimaryChip,
  refData: EarningRefDataMap = DEMO_EARNING_REF_DATA,
): boolean {
  const preset = earningStatusesForChip(chipId, refData);
  if (!preset?.length) {
    return true;
  }
  return !!earning.status && preset.includes(earning.status);
}

function matchesCriteria(
  earning: Earning,
  criteria: EarningFilterCriteria,
  searchText?: string,
): boolean {
  if (searchText?.trim()) {
    const term = searchText.trim().toLowerCase();
    const source = earning.source?.toLowerCase() ?? '';
    const id = earning.id?.toLowerCase() ?? '';
    if (!source.includes(term) && !id.includes(term)) {
      return false;
    }
  }

  if (criteria.source?.trim()) {
    const term = criteria.source.trim().toLowerCase();
    if (!(earning.source?.toLowerCase() ?? '').includes(term)) {
      return false;
    }
  }

  if (criteria.category?.length
    && (!earning.category || !criteria.category.includes(earning.category))) {
    return false;
  }

  if (criteria.status?.length
    && (!earning.status || !criteria.status.includes(earning.status))) {
    return false;
  }

  return true;
}

export function getDemoEarningPage(
  chipId: EarningPrimaryChip,
  criteria: EarningFilterCriteria,
  searchText: string | undefined,
  pageIndex: number,
  pageSize: number,
  refData: EarningRefDataMap = DEMO_EARNING_REF_DATA,
): { items: Earning[]; totalSize: number } {
  const filtered = DEMO_EARNINGS.filter(
    earning => matchesChip(earning, chipId, refData)
      && matchesCriteria(earning, criteria, searchText),
  );
  const start = pageIndex * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    totalSize: filtered.length,
  };
}

export function findDemoEarningById(id: string): Earning | undefined {
  return DEMO_EARNINGS.find(
    earning => earning.id?.toLowerCase() === id.toLowerCase(),
  );
}

export function buildDemoCreatedEarning(data: Partial<Earning>): Earning {
  const interestAccountId = data.category === 'INTEREST' ? data.accountId : undefined;
  return {
    id: `earn-demo-${Date.now()}`,
    currency: 'INR',
    status: interestAccountId ? 'RECEIVED' : 'PENDING',
    ...data,
    accountId: interestAccountId,
    referenceId: interestAccountId,
    referenceType: interestAccountId ? 'ACCOUNT' : undefined,
    transactionId: interestAccountId ? `txn-demo-${Date.now()}` : undefined,
    earningDate: interestAccountId ? new Date().toISOString() : undefined,
  } as Earning;
}

export function updateDemoEarning(id: string, patch: Partial<Earning>): Earning {
  const index = DEMO_EARNINGS.findIndex(earning => earning.id === id);
  if (index >= 0) {
    DEMO_EARNINGS[index] = { ...DEMO_EARNINGS[index], ...patch };
    return DEMO_EARNINGS[index];
  }
  return { id, ...patch } as Earning;
}
