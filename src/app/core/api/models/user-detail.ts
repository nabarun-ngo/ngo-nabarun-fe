/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { UserAddress } from '../models/user-address';
import { UserPhoneNumber } from '../models/user-phone-number';
import { UserRole } from '../models/user-role';
import { UserSocialMedia } from '../models/user-social-media';
export interface UserDetail {
  about?: string;
  activeContributor?: string;
  addresses?: Array<UserAddress>;
  attributes?: {
[key: string]: {
};
};
  dateOfBirth?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  gender?: string;
  id?: string;
  initials?: string;
  lastName?: string;
  loginMethod?: Array<'PASSWORD' | 'EMAIL' | 'SMS'>;
  memberSince?: string;
  middleName?: string;
  phones?: Array<UserPhoneNumber>;
  picture?: string;
  pictureBase64?: string;
  presentAndPermanentAddressSame?: boolean;
  primaryNumber?: string;
  publicProfile?: boolean;
  roleString?: string;
  roles?: Array<UserRole>;
  socialMediaLinks?: Array<UserSocialMedia>;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'BLOCKED';
  title?: string;
  userId?: string;
}
