import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Beneficiary, BeneficiaryRefDataMap, BeneficiaryStatus } from '../domain';
import { BeneficiaryRefData } from '../domain';

function refLabel(refData: BeneficiaryRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(
  status: BeneficiaryStatus | undefined,
  refData: BeneficiaryRefDataMap,
): ListRowBadge {
  const tone = status === 'ACTIVE'
    ? 'success'
    : status === 'COMPLETED'
      ? 'primary'
      : status === 'DROPPED_OUT'
        ? 'danger'
        : 'neutral';
  return { label: refLabel(refData, BeneficiaryRefData.refDataKey.statuses, status), tone };
}

export function mapBeneficiaryListRow(
  beneficiary: Beneficiary,
  refData: BeneficiaryRefDataMap = {},
): ListRowItem<Beneficiary> {
  return {
    id: beneficiary.id,
    title: beneficiary.name,
    subtitle: [
      refLabel(refData, BeneficiaryRefData.refDataKey.types, beneficiary.type),
      beneficiary.category,
    ].filter(Boolean).join(' · '),
    metaLeft: beneficiary.location || undefined,
    metaRight: beneficiary.enrollmentDate
      ? `Enrolled ${date(beneficiary.enrollmentDate, 'dd MMM yyyy')}`
      : undefined,
    badge: statusBadge(beneficiary.status, refData),
    icon: 'group',
    iconTone: 'indigo',
    payload: beneficiary,
  };
}

export function buildBeneficiaryDetailSections(
  beneficiary: Beneficiary,
  refData: BeneficiaryRefDataMap,
  projectLabel?: string,
): ListDetailSection[] {
  return [
    detailKeyValueSection('beneficiary_detail', 'Beneficiary details', [
      detailTextField('Name', beneficiary.name),
      detailTextField('Project', projectLabel ?? beneficiary.projectId),
      detailTextField('Type', refLabel(refData, BeneficiaryRefData.refDataKey.types, beneficiary.type)),
      detailTextField(
        'Status',
        refLabel(refData, BeneficiaryRefData.refDataKey.statuses, beneficiary.status),
      ),
      detailTextField('Category', beneficiary.category || '-'),
      detailTextField(
        'Gender',
        refLabel(refData, BeneficiaryRefData.refDataKey.genders, beneficiary.gender),
      ),
      detailTextField('Age', beneficiary.age != null ? `${beneficiary.age}` : '-'),
      detailTextField(
        'Date of birth',
        beneficiary.dateOfBirth ? date(beneficiary.dateOfBirth) : '-',
      ),
    ]),
    detailKeyValueSection('beneficiary_contact', 'Contact & enrollment', [
      detailTextField('Contact number', beneficiary.contactNumber || '-'),
      detailTextField('Email', beneficiary.email || '-'),
      detailTextField('Location', beneficiary.location || '-'),
      detailTextField('Address', beneficiary.address || '-'),
      detailTextField(
        'Enrolled on',
        beneficiary.enrollmentDate ? date(beneficiary.enrollmentDate) : '-',
      ),
      detailTextField('Exited on', beneficiary.exitDate ? date(beneficiary.exitDate) : '-'),
      detailTextField(
        'Benefits received',
        (beneficiary.benefitsReceived ?? []).join(', ') || '-',
      ),
      detailTextField('Notes', beneficiary.notes || '-'),
    ]),
  ];
}
