import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Asset, AssetCustodyRecord, AssetRefDataMap, AssetStatus } from '../domain';
import { AssetRefData } from '../domain';

function refLabel(refData: AssetRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(
  status: AssetStatus | undefined,
  refData: AssetRefDataMap,
): ListRowBadge {
  const tone = status === 'ASSIGNED'
    ? 'primary'
    : status === 'MAINTENANCE'
      ? 'warning'
      : status === 'RETIRED'
        ? 'neutral'
        : 'success';
  return { label: refLabel(refData, AssetRefData.refDataKey.statuses, status), tone };
}

function money(amount: number | undefined, currency = 'INR'): string {
  if (amount == null) {
    return '-';
  }
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function mapAssetToListRow(
  asset: Asset,
  refData: AssetRefDataMap = {},
  labels: {
    users?: ReadonlyMap<string, string>;
    projects?: ReadonlyMap<string, string>;
  } = {},
): ListRowItem<Asset> {
  const project = asset.projectId ? labels.projects?.get(asset.projectId) : undefined;
  const custodian = asset.custodianUserId
    ? labels.users?.get(asset.custodianUserId)
    : undefined;

  return {
    id: asset.id,
    title: asset.name,
    subtitle: [
      refLabel(refData, AssetRefData.refDataKey.categories, asset.category),
      project,
    ].filter(Boolean).join(' · '),
    metaLeft: asset.serialNumber || asset.location || undefined,
    metaRight: custodian,
    badge: statusBadge(asset.status, refData),
    icon: 'milestones',
    iconTone: 'blue',
    payload: asset,
  };
}

function formatCustodyTimeline(
  records: AssetCustodyRecord[] | undefined,
  users: ReadonlyMap<string, string> = new Map(),
): string {
  if (!records?.length) {
    return 'No custody history recorded.';
  }

  return records.map(record => {
    const custodian = users.get(record.custodianUserId) ?? record.custodianUserId;
    const assigned = date(record.assignedAt, 'dd MMM yyyy');
    if (record.returnedAt) {
      return `${assigned}: assigned to ${custodian}; returned ${date(record.returnedAt, 'dd MMM yyyy')}${
        record.notes ? ` — ${record.notes}` : ''
      }`;
    }
    return `${assigned}: assigned to ${custodian}${
      record.notes ? ` — ${record.notes}` : ''
    } (active)`;
  }).join('\n');
}

export function buildAssetDetailSections(
  asset: Asset,
  refData: AssetRefDataMap,
  labels: {
    users?: ReadonlyMap<string, string>;
    projects?: ReadonlyMap<string, string>;
    expenses?: ReadonlyMap<string, string>;
  } = {},
): ListDetailSection[] {
  const person = (id?: string): string =>
    id ? labels.users?.get(id) ?? id : '-';

  return [
    detailKeyValueSection('asset_detail', 'Asset details', [
      detailTextField('Name', asset.name),
      detailTextField(
        'Category',
        refLabel(refData, AssetRefData.refDataKey.categories, asset.category),
      ),
      detailTextField('Serial number', asset.serialNumber || '-'),
      detailTextField('Location', asset.location || '-'),
      detailTextField(
        'Status',
        refLabel(refData, AssetRefData.refDataKey.statuses, asset.status),
      ),
      detailTextField(
        'Project',
        asset.projectId ? labels.projects?.get(asset.projectId) ?? asset.projectId : '-',
      ),
      detailTextField(
        'Linked expense',
        asset.expenseId ? labels.expenses?.get(asset.expenseId) ?? asset.expenseId : '-',
      ),
      detailTextField('Custodian', person(asset.custodianUserId)),
    ]),
    detailKeyValueSection('asset_financials', 'Financials', [
      detailTextField('Purchase date', asset.purchaseDate ? date(asset.purchaseDate) : '-'),
      detailTextField('Purchase cost', money(asset.purchaseCost, asset.currency)),
      detailTextField('Current value', money(asset.currentValue, asset.currency)),
      detailTextField('Depreciation notes', asset.depreciationMethodNotes || '-'),
      detailTextField('Maintenance notes', asset.maintenanceNotes || '-'),
    ]),
    detailKeyValueSection('asset_custody', 'Custody timeline', [
      detailTextField(
        'History',
        formatCustodyTimeline(asset.custodyHistory, labels.users),
      ),
    ]),
  ];
}
