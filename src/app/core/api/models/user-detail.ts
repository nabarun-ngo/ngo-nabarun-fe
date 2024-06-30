/* tslint:disable */
/* eslint-disable */
import { UserAddress } from '../models/user-address';
import { UserPhoneNumber } from '../models/user-phone-number';
import { UserRole } from '../models/user-role';
import { UserSocialMedia } from '../models/user-social-media';
export interface UserDetail {
  about?: string;
  activeContributor?: string;
  addresses?: Array<UserAddress>;
  dateOfBirth?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  gender?: string;
  id?: string;
  initials?: string;
  lastName?: string;
  memberSince?: string;
  middleName?: string;
  phones?: Array<UserPhoneNumber>;
  picture?: string;
  pictureBase64?: string;
  primaryNumber?: string;
  publicProfile?: boolean;
  roleString?: string;
  roles?: Array<UserRole>;
  socialMediaLinks?: Array<UserSocialMedia>;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  title?: string;
  userId?: string;
}
