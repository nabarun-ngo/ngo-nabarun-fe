import type { ResolveFn } from '@angular/router';
import type { BeneficiaryRefDataMap } from '../domain';
import { beneficiaryRefData } from './beneficiary-data.mapper';

/** Beneficiary enums are domain constants; no reference-data call is needed. */
export const beneficiaryRefDataResolver: ResolveFn<BeneficiaryRefDataMap> = () =>
  beneficiaryRefData();
