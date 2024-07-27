import { KeyValue } from "src/app/core/api/models";
export type inputType='text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'editor' | 'multiselect' | 'radio' | '';

export interface UniversalInputModel{
    tagName : 'input' | 'textarea' | 'select' ;
    inputType : inputType;
    style? : string;
    html_id?:string;
    appearance?: 'outline'| 'fill';
    placeholder?:string;
    selectList?: KeyValue[];
    disabled?:boolean;
    cssInputClass?:string;
    cssClass?:string;
    csslabelClass?:string;
    labelName?:string;

}