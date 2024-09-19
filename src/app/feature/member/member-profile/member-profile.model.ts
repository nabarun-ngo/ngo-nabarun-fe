import { KeyValue, UserDetail } from "src/app/core/api/models";
import { OperationMode } from "../member.const";

export interface MemberProfileModel{
    refData: { [key: string]: KeyValue[]; }; 
    member: UserDetail;
    isSelfProfile?: boolean;
    mode: OperationMode; 
}