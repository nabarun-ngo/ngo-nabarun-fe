import { PagedResult } from "src/app/shared/model/paged-result.model";

export interface Address {
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    country: string;
    district: string;
    hometown: string;
    landmark?: string;
    state: string;
    zipCode: string;
}

export interface PhoneNumber {
    code: string;
    fullNumber?: string;
    number: string;
}

export interface Role {
    description?: string;
    roleCode: string;
    roleName: string;
}
export interface Link {
    linkName: string;
    linkType: 'facebook' | 'whatsapp' | 'twitter' | 'linkedin' | 'instagram';
    linkValue: string;
}

export interface RoleHistory {
    period: string;
    roleNames: Array<string>;
    roles: Array<Role>;
}

export interface User {
    about?: string;
    activeDonor: boolean;
    addressSame?: boolean;
    blocked: boolean;
    createdOn: string;
    dateOfBirth?: string;
    email: string;
    firstName: string;
    fullName: string;
    gender?: string;
    id: string;
    lastName: string;
    loginMethod: Array<string>;
    roleHistory?: Array<RoleHistory>;
    middleName?: string;
    permanentAddress?: Address;
    picture?: string;
    presentAddress?: Address;
    primaryNumber?: PhoneNumber;
    publicProfile: boolean;
    roles: Array<Role>;
    secondaryNumber?: PhoneNumber;
    socialMediaLinks: Array<Link>;
    status: 'DRAFT' | 'ACTIVE' | 'BLOCKED' | 'DELETED';
    title?: string;
    userId?: string;


    /////
    panNumber?: string;
    aadharNumber?: string;
    panFile?: string;
    aadharFile?: string;
    roleCodes: string[];

}

export type PagedUser = PagedResult<User>;
