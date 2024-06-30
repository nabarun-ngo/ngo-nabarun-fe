import { KeyValue } from "src/app/core/api/models";
export type inputType='text' | 'email' | 'password' | 'number' | 'date' | '';

export interface UniversalInputModel{
    tagName : 'input' | 'textarea' | 'select';
    inputType : inputType;
    style? : string;
    appearance?: 'outline'| 'fill';
    placeholder?:string;
    selectList?: KeyValue[];
    //disabled?:boolean;
    cssClass?:string;
    labelName?:string;

}