import { KeyValue } from "src/app/core/api-client/models";
import { OperationMode } from "../member.const";
import { User } from "../models/member.model";

export interface MemberProfileModel {
    refData: { [key: string]: KeyValue[]; };
    member: User;
    isSelfProfile?: boolean;
    mode: OperationMode;
}