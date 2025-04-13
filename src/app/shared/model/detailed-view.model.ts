import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel, inputType } from "./universal-input.model";
import { DocumentDetail, KeyValue } from "src/app/core/api/models";
import { AccordionList } from "./accordion-list.model";
import { Accordion } from "../utils/accordion";
import { EventEmitter } from "@angular/core";
import { FileUpload } from "../components/generic/file-upload/file-upload.component";

export interface DetailedView {

  
    section_html_id?:string;
    section_name: string;
    section_type: 'key_value' | 'doc_list' | 'custom' | 'accordion_list';
    hide_section?: boolean;
    content?: DetailedViewField[];
    section_form:FormGroup;
    show_form?: boolean;
    documentHeader?: string;
    documents?: DocumentDetail[]
    accordionList?:AccordionList;
    accordion?: {
        createBtn?: boolean;
        object:Accordion<any>,
        accordionOpened: EventEmitter<{rowIndex: number;}>;
        buttonClick: EventEmitter<{buttonId: string;rowIndex: number;}>
    };
    doc?: {
        docChange: EventEmitter<FileUpload[]>; 
    }
}

export interface DetailedViewField {
    field_html_id?:string;
    field_name?: string;
    field_value: string;
    field_display_value?: string;
    field_value_splitter?: string;
    hide_field?: boolean;
    editable?:boolean;
    form_control_name?: string;
    form_input?: UniversalInputModel;
    form_input_validation?: ValidatorFn[]
    show_display_value?:boolean;
    ref_data_section?:string;
}