import { FormGroup, Validators } from "@angular/forms";
import { AdditionalField, DocumentDetail, KeyValue, RequestDetail, WorkDetail } from "src/app/core/api/models";
import { date } from "src/app/core/service/utilities.service";
import { RequestConstant, workListTab } from "./request.const";
import { DetailedView, DetailedViewField } from "src/app/shared/components/generic/detailed-view/detailed-view.model";

const refDataKey=RequestConstant.refDataKey

const getAdditionalField = (fields: AdditionalField[]) => {
    return fields?.map(m1 => {
        return {
            field_name: m1.name!,
            field_html_id: m1.id!,
            field_value: m1.value!,
            hide_field: false,
            form_control_name: m1.key,
            editable: true,
            form_input: {
                tagName: m1.type as any,
                inputType: m1.valueType as any,
                placeholder: m1.name!,
                selectList: m1.options?.map(o => {
                    return { key: o, displayValue: o };
                })
            },
            form_input_validation: m1.mandatory ? [Validators.required] : []
        } as DetailedViewField;
    })
}

export const getWorkDetailSection = (m: WorkDetail, tab: workListTab): DetailedView => {
    return {
        section_name: 'Work Details',
        section_type: 'key_value',
        section_html_id: 'work_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Work Id',
                field_html_id: 'work_id',
                field_value: m.id!
            },
            {
                field_name: 'Work Type',
                field_html_id: 'work_type',
                field_value: m.workType!,
            },
            {
                field_name: 'Work Description',
                field_html_id: 'work_description',
                field_value: m.description!,
            },
            {
                field_name: 'Creation Date',
                field_html_id: 'creation_date',
                field_value: date(m.createdOn)
            },
            {
                field_name: 'Assigned to',
                field_html_id: 'pending_with',
                field_value: m.pendingWith?.map(m=>m.fullName).join(', ')!,
                hide_field: tab == 'completed_worklist'
            },
            {
                field_name: 'Decision Owner',
                field_html_id: 'decision_owner',
                field_value: m.decisionOwner?.fullName!,
                hide_field: tab == 'pending_worklist'
            },
            {
                field_name: 'Decision Date',
                field_html_id: 'decision_date',
                field_value: date(m.decisionDate),
                hide_field: tab == 'pending_worklist',
            },
        ]
    };
}

export const getWorkActionDetailSection = (m: WorkDetail): DetailedView => {
    return {
        section_name: 'Work Action Detail',
        section_type: 'key_value',
        section_html_id: 'action_details',
        hide_section:m.additionalFields?.length == 0,
        section_form: new FormGroup({}),
        content: getAdditionalField(m.additionalFields!)
    };
}



export const getRequestDetailSection = (request: RequestDetail): DetailedView => {
    return {
        section_name: 'Request Details',
        section_type: 'key_value',
        section_html_id: 'request_detail',
        section_form: new FormGroup({}),//Here you have to pass form group
        content: [
            {
                field_name: 'Request Id',
                field_value: request?.id!,
            },
            {
                field_name: 'Request Type',
                field_value: request?.type!,
                show_display_value:true,
                ref_data_section:refDataKey.workflowTypes
            },
            {
                field_name: 'Request Status',
                field_value: request?.status!,
                show_display_value:true,
                ref_data_section:refDataKey.workflowSteps
            },
            {
                field_name: 'Requester Name',
                field_value: request?.requester?.fullName!,
            },
            {
                field_name: 'Request Created By',
                field_value: request?.delegatedRequester?.fullName!,
                hide_field: !(request.delegated!)
            },
            {
                field_name: 'Request Description',
                field_value: request?.description!,
            },
            {
                field_name: 'Request Date',
                field_value: date(request?.createdOn!),
            },
            {
                field_name: 'Resolved On',
                field_value: date(request?.resolvedOn!),
                hide_field: !request?.resolvedOn
            },
            {
                field_name: 'Resolve Remarks',
                field_value: request?.remarks!,
                hide_field: !request?.remarks
            },
        ]
    };
}


export const getRequestAdditionalDetailSection = (m: RequestDetail): DetailedView => {
    return {
        section_name: 'Request Additional Details',
        section_type: 'key_value',
        section_html_id: 'request_add_detail',
        hide_section : m.additionalFields?.length == 0,
        section_form: new FormGroup({}),
        content: getAdditionalField(m.additionalFields!)
    };
}

export const getDocumentDetailSection=(m: DocumentDetail[]): DetailedView =>{
    return {
        section_name: 'Documents',
        section_type: 'doc_list',
        section_html_id: 'request_docs',
        hide_section : m.length == 0,
        section_form: new FormGroup({}),
        documents:m
    };
}


