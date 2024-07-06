import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel, inputType } from "../universal-input/universal-input.model";

export interface DetailedView {
    section_html_id?:string;
    section_name: string;
    section_type: 'key_value' | 'doc_list' | 'custom';
    hide_section?: boolean;
    content?: DetailedViewField[];
    section_form:FormGroup;
    show_form?: boolean;
}

export interface DetailedViewField {
    field_html_id?:string;
    field_name: string;
    field_value: string;
    hide_field?: boolean;
    editable:boolean;
    form_control_name?: string;
    form_input?: UniversalInputModel;
    form_input_validation?: ValidatorFn[]

}