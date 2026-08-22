import type { ListRowItem, ListDetailSection } from '@nabarun-ngo/list-dashboard-core';
import {
  detailKeyValueSection, detailTextField,
} from '@nabarun-ngo/list-dashboard-angular';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { Doc } from 'src/app/shared/models/document.model';
import { date } from 'src/app/shared/utils/utilities.service';
import { DonationRefData as DonationRefDataKeys } from '../../finance.const';
import type { Donation, DonationRefData } from '../domain';
import { donationStatusGroups } from './donation.rules';

const label = (refData: DonationRefData, key: string, value?: string): string =>
  ((refData[key] as KeyValue[] | undefined)?.find(item => item.key === value)?.displayValue)
    ?? value ?? '-';

export function mapDonationListRow(
  donation: Donation,
  refData: DonationRefData = {},
): ListRowItem<Donation> {
  const groups = donationStatusGroups(refData);
  const tone = groups.closed.includes(donation.status) ? 'success'
    : groups.outstanding.includes(donation.status) ? 'warning'
    : donation.status === 'CANCELLED' || donation.status === 'PAYMENT_FAILED'
      ? 'danger' : 'neutral';
  return {
    id: donation.id,
    title: donation.formattedAmount,
    subtitleParts: [
      { text: label(refData, DonationRefDataKeys.refDataKey.type, donation.type) },
      { text: donation.displayName, linkId: 'donation_donor' },
    ],
    metaLeft: donation.type === 'ONETIME' ? 'One-time donation'
      : `${donation.startDate ? date(donation.startDate, 'dd MMM yyyy') : '…'} - ${
        donation.endDate ? date(donation.endDate, 'dd MMM yyyy') : '…'}`,
    metaRight: date(donation.raisedOn, 'dd MMM yyyy'),
    badge: { label: label(refData, DonationRefDataKeys.refDataKey.status, donation.status), tone },
    icon: 'donation',
    iconTone: donation.isGuest ? 'indigo' : 'orange',
    payload: donation,
  };
}

export function buildDonationDetailSections(
  donation: Donation,
  refData: DonationRefData,
): ListDetailSection[] {
  const fields = [
    detailTextField('Donation number', donation.id),
    detailTextField('Donor', donation.displayName),
    detailTextField('Donation type', label(refData, DonationRefDataKeys.refDataKey.type, donation.type)),
    detailTextField('Donation amount', donation.formattedAmount),
    detailTextField('Donation status', label(refData, DonationRefDataKeys.refDataKey.status, donation.status)),
    detailTextField('Raised on', date(donation.raisedOn)),
    ...(donation.activityName ? [detailTextField('Donated for', donation.activityName)] : []),
    ...(donation.paidOn ? [detailTextField('Paid on', date(donation.paidOn))] : []),
    ...(donation.transactionRef ? [detailTextField('Transaction Ref', donation.transactionRef)] : []),
    ...(donation.remarks ? [detailTextField('Remarks', donation.remarks)] : []),
  ];
  return [detailKeyValueSection('donation_detail', 'Donation Details', fields)];
}

export const buildDonationDocumentsLoading = (): ListDetailSection => ({
  type: 'documents', id: 'donation_documents', title: 'Documents',
  documents: [], loading: true,
});

export const buildDonationDocuments = (documents: Doc[]): ListDetailSection => ({
  type: 'documents', id: 'donation_documents', title: 'Documents',
  documents, loading: false,
});
