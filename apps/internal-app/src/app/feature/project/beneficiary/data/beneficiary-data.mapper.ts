import type {
  BeneficiaryDetailDto,
  BeneficiaryListResponseDto,
  CreateBeneficiaryDto,
  UpdateBeneficiaryDto,
} from 'src/app/core/api/api-client/models';
import type { Beneficiary, BeneficiaryRefDataMap, PagedBeneficiaries } from '../domain';
import {
  BENEFICIARY_GENDERS,
  BENEFICIARY_STATUSES,
  BENEFICIARY_TYPES,
  BeneficiaryRefData,
} from '../domain';

export function mapBeneficiaryDto(dto: BeneficiaryDetailDto): Beneficiary {
  return { ...dto };
}

export function mapPagedBeneficiaries(dto: BeneficiaryListResponseDto): PagedBeneficiaries {
  return {
    content: (dto.items ?? []).map(mapBeneficiaryDto),
    totalSize: dto.total ?? 0,
    pageIndex: dto.pageIndex,
    pageSize: dto.pageSize,
  };
}

export function mapToCreateBeneficiary(data: Partial<Beneficiary>): CreateBeneficiaryDto {
  return {
    name: String(data.name ?? ''),
    type: (data.type ?? 'INDIVIDUAL') as CreateBeneficiaryDto['type'],
    enrollmentDate: String(data.enrollmentDate ?? new Date().toISOString().slice(0, 10)),
    category: data.category,
    gender: data.gender as CreateBeneficiaryDto['gender'],
    age: data.age,
    dateOfBirth: data.dateOfBirth,
    contactNumber: data.contactNumber,
    email: data.email,
    address: data.address,
    location: data.location,
    notes: data.notes,
    benefitsReceived: data.benefitsReceived ?? [],
  };
}

/** Enrollment date and status are not editable; status changes through the exit action. */
export function mapToUpdateBeneficiary(data: Partial<Beneficiary>): UpdateBeneficiaryDto {
  return {
    name: data.name,
    type: data.type as UpdateBeneficiaryDto['type'],
    category: data.category,
    gender: data.gender as UpdateBeneficiaryDto['gender'],
    age: data.age,
    contactNumber: data.contactNumber,
    email: data.email,
    address: data.address,
    location: data.location,
    notes: data.notes,
    benefitsReceived: data.benefitsReceived,
  };
}

export function beneficiaryRefData(): BeneficiaryRefDataMap {
  return {
    [BeneficiaryRefData.refDataKey.statuses]: BENEFICIARY_STATUSES,
    [BeneficiaryRefData.refDataKey.types]: BENEFICIARY_TYPES,
    [BeneficiaryRefData.refDataKey.genders]: BENEFICIARY_GENDERS,
  };
}
