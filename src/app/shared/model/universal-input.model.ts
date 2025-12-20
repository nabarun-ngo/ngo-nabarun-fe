import { KeyValue } from "./key-value.model";

export type inputType = 'text' | 'email' | 'phone' | 'password' | 'number' | 'date' | 'time' | 'editor' | 'multiselect' | 'radio' | 'check' | '';

export interface UniversalInputModel {
    tagName: 'input' | 'textarea' | 'select';
    inputType: inputType;
    style?: string;
    html_id: string;
    appearance?: 'outline' | 'fill';
    placeholder?: string;
    selectList?: KeyValue[];
    disabled?: boolean;
    cssInputClass?: string;
    cssClass?: string;
    csslabelClass?: string;
    labelName?: string;
    props?: { [key: string]: any };
    autocomplete?: boolean;

}