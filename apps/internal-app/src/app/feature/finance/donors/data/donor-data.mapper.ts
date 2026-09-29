import { DonorResponseDto } from 'src/app/core/api/api-client/models/donor-response-dto';
import { DonorRefDataDto } from 'src/app/core/api/api-client/models';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { DonorRefData } from '../../finance.const';
import type { Donor, PagedDonors } from '../domain';

export function mapDonorDtoToDonor(dto: DonorResponseDto): Donor {
  return {
    id: dto.id,
    type: dto.type,
    status: dto.status,
    fullName: dto.fullName,
    email: dto.email,
    phoneCode: dto.phoneCode,
    phoneNumber: dto.phoneNumber,
    preferredAmount: dto.preferredAmount,
    statusEndDate: dto.statusEndDate,
    userProfileId: dto.userProfileId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapPagedDonorDtoToPagedDonors(payload: {
  content?: DonorResponseDto[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
} | undefined | null): PagedDonors {
  return {
    content: (payload?.content ?? []).map(mapDonorDtoToDonor),
    totalSize: payload?.totalSize ?? 0,
    pageIndex: payload?.pageIndex ?? 0,
    pageSize: payload?.pageSize ?? 0,
  };
}

type RefDataItem = { key?: string; value?: string; displayValue?: string };

function mapRefItems(items: RefDataItem[] | undefined): KeyValue[] {
  return (items ?? [])
    .filter(item => !!item.key)
    .map(item => ({
      key: item.key!,
      displayValue: item.displayValue ?? item.value ?? item.key!,
    }));
}

/** Maps donor reference-data DTO keys to dashboard refData shape. */
export function mapDonorRefDataDtoToRefData(
  dto: DonorRefDataDto | undefined,
): Record<string, KeyValue[] | string[]> {
  if (!dto) {
    return {};
  }

  const result: Record<string, KeyValue[] | string[]> = {
    [DonorRefData.refDataKey.status]: mapRefItems(dto.donorStatuses as RefDataItem[]),
    [DonorRefData.refDataKey.memberEditableStatus]: mapRefItems(
      dto.memberEditableDonorStatuses as RefDataItem[],
    ),
  };
  if (dto.statusesRequiringEndDate?.length) {
    result[DonorRefData.refDataKey.statusesRequiringEndDate] = [
      ...dto.statusesRequiringEndDate,
    ];
  }
  return result;
}
