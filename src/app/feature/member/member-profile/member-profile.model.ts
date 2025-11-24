import { KeyValue } from "src/app/core/api/models";
import { OperationMode } from "../member.const";
import { UserDto } from "src/app/core/api-client/models";

export interface MemberProfileModel{
    refData: { [key: string]: KeyValue[]; }; 
    member: UserDto;
    isSelfProfile?: boolean;
    mode: OperationMode; 
}