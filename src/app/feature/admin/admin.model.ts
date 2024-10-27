import { UniversalInputModel } from "src/app/shared/components/generic/universal-input/universal-input.model";

export interface AdminServiceInfo{
    id:string;
    name:string;
    description:string;
    inputs: AdminServiceInput[];
}


export interface AdminServiceInput{
    id:string;
    name:string;
    value?:string;
    model: UniversalInputModel;
    required?:boolean;
}