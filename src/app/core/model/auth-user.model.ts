export interface AuthUser{
    active_user: boolean;
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    nickname: string;
    picture: string;
    sub : string;
    user_id: string;
    profile_id: string;
    profile_updated:boolean;
   // scopes: string[];
}