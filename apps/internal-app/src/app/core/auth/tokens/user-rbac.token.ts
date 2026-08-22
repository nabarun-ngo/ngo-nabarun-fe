import { RbacUserAccessSnapshot } from "@nabarun-ngo/auth-core";

export interface AppRbacUserAccessSnapshot extends RbacUserAccessSnapshot {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    profilePic?: string;
    profileComplete?: boolean;
}

