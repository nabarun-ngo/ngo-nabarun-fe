import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel, inputType } from "../universal-input/universal-input.model";
import { DocumentDetail, KeyValue } from "src/app/core/api/models";
import { AccordionList } from "../accordion-list/accordion-list.model";

export interface DetailedView {
  
    section_html_id?:string;
    section_name: string;
    section_type: 'key_value' | 'doc_list' | 'custom' | 'accordion_list';
    hide_section?: boolean;
    content?: DetailedViewField[];
    section_form:FormGroup;
    show_form?: boolean;
    accordionList?:AccordionList;
    documentHeader?: string;
    documents?: DocumentDetail[]
}

export interface DetailedViewField {
    field_html_id?:string;
    field_name?: string;
    field_value: string;
    hide_field?: boolean;
    editable?:boolean;
    form_control_name?: string;
    form_input?: UniversalInputModel;
    form_input_validation?: ValidatorFn[]
    show_display_value?:boolean;
    ref_data_section?:string;
}