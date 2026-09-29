import type { ResolveFn } from '@angular/router';
import type { RiskRefDataMap } from '../domain';
import { riskRefData } from './risk-data.mapper';

/** Risk enums are domain constants; no reference-data call is needed. */
export const riskRefDataResolver: ResolveFn<RiskRefDataMap> = () => riskRefData();
