/* tslint:disable */
/* eslint-disable */
export interface AccountDetailFilter {
  includeBalance?: boolean;
  includePaymentDetail?: boolean;
  status?: Array<'ACTIVE' | 'INACTIVE'>;
  type?: Array<'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION'>;
}
