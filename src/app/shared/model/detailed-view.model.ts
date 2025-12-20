import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel, inputType } from "./universal-input.model";
import { AccordionList } from "./accordion-list.model";
import { Accordion } from "../utils/accordion";
import { EventEmitter } from "@angular/core";
import { FileUpload } from "../components/generic/file-upload/file-upload.component";
import { BehaviorSubject } from "rxjs";
import { AlertData } from "./alert.model";
import { Doc } from "./document.model";

export interface AlertList {
    readonly data: AlertData;
    readonly hide_alert?: boolean;
}

export interface DetailedView<NumType = any> {
    readonly section_html_id?: string;
    readonly section_name: string;
    readonly section_type: 'key_value' | 'doc_list' | 'custom' | 'accordion_list';
    hide_section?: boolean;
    readonly content?: DetailedViewField[];
    readonly section_form: FormGroup;
    show_form?: boolean;
    readonly documentHeader?: string;
    readonly documents?: Doc[];
    accordionList?: AccordionList;
    accordion?: {
        parentId?: string;
        createBtn?: boolean;
        object: Accordion<NumType>,
        accordionOpened: EventEmitter<{ rowIndex: number; }>;
        buttonClick: EventEmitter<{ buttonId: string; rowIndex: number; }>
    };
    readonly section_alerts?: AlertList[];
    readonly form_alerts?: AlertList[];
    doc?: {
        docChange: EventEmitter<FileUpload[]>;
        docList?: BehaviorSubject<FileUpload[]>;
    }
}

export interface DetailedViewField {
    field_html_id?: string;
    field_name?: string;
    field_value: string;
    field_display_value?: string;
    field_value_splitter?: string;
    hide_field?: boolean;
    editable?: boolean;
    form_control_name?: string;
    form_input?: UniversalInputModel;
    form_input_validation?: ValidatorFn[]
    show_display_value?: boolean;
    ref_data_section?: string;
}