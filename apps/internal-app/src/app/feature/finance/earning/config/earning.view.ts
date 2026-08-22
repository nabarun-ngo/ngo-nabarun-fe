import type { ListDetailSection, ListRowBadge, ListRowIconTone, ListRowItem } from '@nabarun-ngo/list-dashboard-core';
import {
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-angular';
import type { Doc } from 'src/app/shared/models/document.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Earning, EarningRefDataMap, EarningStatus } from '../domain';
import { EarningRefData } from '../domain';

function statusBadge(status: EarningStatus | undefined): ListRowBadge {
  switch (status) {
    case 'RECEIVED':
      return { label: 'Received', tone: 'success' };
    case 'PENDING':
      return { label: 'Pending', tone: 'warning' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'neutral' };
    default:
      return { label: status ?? 'Unknown', tone: 'neutral' };
  }
}

function iconToneForCategory(category?: string): ListRowIconTone {
  switch (category) {
    case 'INTEREST':
      return 'blue';
    case 'GRANT':
      return 'green';
    case 'SERVICE':
      return 'indigo';
    case 'SPONSORSHIP':
      return 'amber';
    default:
      return 'neutral';
  }
}

function formatAmount(earning: Earning): string {
  const currency = earning.currency === 'INR' ? '₹' : (earning.currency ?? '₹');
  if (earning.amount != null) {
    return `${currency}${earning.amount.toLocaleString('en-IN')}`;
  }
  return '—';
}

function refLabel(
  refData: EarningRefDataMap,
  section: string,
  code?: string | null,
): string {
  if (!code) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === code)?.displayValue ?? code;
}

export function mapEarningListRow(earning: Earning): ListRowItem<Earning> {
  return {
    id: earning.id ?? '',
    title: formatAmount(earning),
    subtitle: earning.source ?? 'Earning',
    metaLeft: earning.category ?? undefined,
    metaRight: earning.earningDate ?? earning.createdAt ?? undefined,
    badge: statusBadge(earning.status as EarningStatus | undefined),
    icon: 'earning',
    iconTone: iconToneForCategory(earning.category),
    payload: earning,
  };
}

export function buildEarningDetailSections(
  earning: Earning,
  refData: EarningRefDataMap,
): ListDetailSection[] {
  const fields = [
    detailTextField('Earning ID', earning.id ?? '-'),
    detailTextField('Source', earning.source ?? '-'),
    detailTextField(
      'Category',
      refLabel(refData, EarningRefData.refDataKey.category, earning.category),
    ),
    detailTextField(
      'Amount',
      earning.amount != null ? `${earning.currency || '₹'} ${earning.amount}` : '-',
    ),
    ...(earning.description
      ? [detailTextField('Description', earning.description)]
      : []),
    detailTextField(
      'Status',
      refLabel(refData, EarningRefData.refDataKey.status, earning.status),
    ),
    ...(earning.accountId
      ? [detailTextField('Receiving account', earning.accountId)]
      : []),
    ...(earning.transactionId
      ? [detailTextField('Transaction reference', earning.transactionId)]
      : []),
    ...(earning.earningDate
      ? [detailTextField('Earning date', date(earning.earningDate))]
      : []),
    ...(earning.createdAt
      ? [detailTextField('Created at', date(earning.createdAt))]
      : []),
    ...(earning.receivedDate
      ? [detailTextField('Received date', date(earning.receivedDate))]
      : []),
  ];

  return [detailKeyValueSection('earning_detail', 'Earning details', fields)];
}

export const buildEarningDocumentsLoading = (): ListDetailSection => ({
  type: 'documents',
  id: 'earning_doc_list',
  title: 'Documents',
  documents: [],
  loading: true,
});

export const buildEarningDocuments = (documents: Doc[]): ListDetailSection => ({
  type: 'documents',
  id: 'earning_doc_list',
  title: 'Documents',
  documents,
  loading: false,
});
