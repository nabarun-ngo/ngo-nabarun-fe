/* tslint:disable */
/* eslint-disable */
export interface AdditionalField {
  id?: string;
  key?: 'firstName' | 'lastName' | 'email' | 'dialCode' | 'mobileNumber' | 'hometown' | 'reasonForJoining' | 'howDoUKnowAboutNabarun' | 'password' | 'name' | 'amount' | 'paymentMethod' | 'paidToAccount' | 'decision';
  mandatory?: boolean;
  name?: string;
  options?: Array<string>;
  type?: string;
  updateField?: boolean;
  value?: string;
  valueType?: string;
}
