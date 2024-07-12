/* tslint:disable */
/* eslint-disable */
export interface AccountDetailFilter {
  accountHolderId?: string;
  includeBalance?: boolean;
  includePaymentDetail?: boolean;
  status?: Array<'ACTIVE' | 'INACTIVE' | 'BLOCKED'>;
  type?: Array<'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION'>;
}
