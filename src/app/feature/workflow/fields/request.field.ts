import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { requestTab, WorkflowConstant, workListTab } from "../workflow.const";
import { DetailedView, DetailedViewField } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { WorkflowRequest } from "../model/request.model";
import { DocumentDto, FieldAttributeDto } from "src/app/core/api-client/models";
import { mapDocDtoToDoc } from "src/app/shared/model/document.model";
import { KeyValue } from "src/app/shared/model/key-value.model";




export const getRequestDetailSection = (
    request: WorkflowRequest, refData: { [name: string]: KeyValue[]; }, isCreate: boolean = false, isDelegated: boolean = false): DetailedView => {
    return {
        section_name: 'Request Detail',
        section_type: 'key_value',
        section_html_id: 'request_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Request Id',
                field_value: request?.id!,
                hide_field: isCreate
            },
            {
                field_name: 'Request Type',
                field_value: request?.type!,
                editable: isCreate,
                field_html_id: 'request_type',
                form_control_name: 'requestType',
                show_display_value: true,
                ref_data_section: WorkflowConstant.refDataKey.workflowTypes,
                form_input: {
                    html_id: 'requestType',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select Request type',
                    selectList: isDelegated ? refData[WorkflowConstant.refDataKey.visibleWorkflowTypes] :
                        refData[WorkflowConstant.refDataKey.visibleWorkflowTypes].filter(x => x.key !== 'JOIN_REQUEST'),
                },
                form_input_validation: [Validators.required],
            },
            {
                field_name: 'Request Status',
                field_value: request?.status!,
                show_display_value: true,
                ref_data_section: WorkflowConstant.refDataKey.workflowStatuses,
                hide_field: isCreate
            },
            {
                field_name: 'Request Description',
                field_value: request?.description!,
                hide_field: isCreate,
            },
            {
                field_name: 'Requested For',
                field_value: request?.initiatedForName!,
                editable: isCreate && isDelegated,
                field_html_id: 'initiatedFor',
                form_control_name: 'initiatedFor',
                hide_field: isCreate && !isDelegated,
                form_input: {
                    html_id: 'initiatedFor',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select Requested For',
                    selectList: []
                },
                form_input_validation: [],
            },
            {
                field_name: 'Requested By',
                field_value: request?.initiatedByName!,
                hide_field: isCreate
            },
            {
                field_name: 'Request Date',
                field_value: date(request?.createdAt!),
                hide_field: isCreate
            },
            {
                field_name: 'Current Step',
                field_value: request?.steps.find((step) => step.stepId == request?.currentStepId)?.name!,
                hide_field: isCreate
            },
            {
                field_name: 'Resolved On',
                field_value: date(request?.completedAt!),
                hide_field: !request?.completedAt || isCreate
            },
            {
                field_name: 'Failure Reason',
                field_value: request?.failureReason!,
                hide_field: !request?.failureReason || isCreate
            },
        ]
    };
}

export const getRequestStepsSection = (
    request: WorkflowRequest, refData: { [name: string]: KeyValue[]; }, isCreate: boolean = false): DetailedView => {

    return {
        section_name: 'Request Steps',
        section_type: 'editable_table',
        section_html_id: 'request_steps',
        hide_section: isCreate || request?.steps.length == 0,
        section_form: request?.steps ? new FormGroup({
            steps: new FormArray([
                ...request?.steps?.map(item => new FormGroup({
                    stepName: new FormControl(item.name, [Validators.required]),
                    stepStatus: new FormControl(item.status, [Validators.required]),
                }))
            ])
        }) : new FormGroup({}),
        editableTable: {
            formArrayName: 'steps',
            allowAddRow: false,
            allowDeleteRow: false,
            columns: [
                {
                    columnDef: 'stepName',
                    header: 'Step Name',
                    editable: false,

                },
                {
                    columnDef: 'stepStatus',
                    header: 'Step Status',
                    editable: false,
                    show_display_value: true,
                    ref_data_section: WorkflowConstant.refDataKey.workflowStepStatuses,
                }
            ]
        }
    };
}

export const getRequestAdditionalDetailSection = (m: WorkflowRequest | undefined, fields: FieldAttributeDto[], isCreate: boolean = false): DetailedView => {
    return {
        section_name: 'Request Data',
        section_type: 'key_value',
        section_html_id: 'request_data',
        hide_section: !isCreate && (!m?.requestData || Object.keys(m?.requestData).length === 0),
        section_form: new FormGroup({}),
        show_form: isCreate,
        content: fields.map(field => ({
            editable: true,
            field_name: field.value,
            field_html_id: field.key,
            field_value: m?.requestData[field.key],
            form_control_name: field.key,
            form_input: {
                html_id: field.key + '_field',
                tagName: field.fieldType,
                inputType: field.type,
                placeholder: 'Enter ' + field.value,
                selectList: field.fieldOptions.map(option => ({
                    key: option,
                    displayValue: option
                })),
            },
            form_input_validation: [Validators.required],
        }) as DetailedViewField)
    };
}

export const getDocumentDetailSection = (m: DocumentDto[]): DetailedView => {
    return {
        section_name: 'Documents',
        section_type: 'doc_list',
        section_html_id: 'request_docs',
        hide_section: m.length == 0,
        section_form: new FormGroup({}),
        documents: m.map(d => mapDocDtoToDoc(d))
    };
}


export const requestSearchInput = (
    tab: requestTab,
    refData: {
        [name: string]: any[];
    }
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search by Request ID, Type, or Description',
        advancedSearch: {
            title: 'Advanced Request Search',
            buttonText: {
                search: 'Search Requests',
                close: 'Clear & Close'
            },
            searchFormFields: [
                {
                    formControlName: 'type',
                    inputModel: {
                        tagName: 'select',
                        inputType: '',
                        html_id: 'type',
                        labelName: 'Request Type',
                        placeholder: 'Select Request Type',
                        selectList: [
                            { key: 'JOIN_REQUEST', displayValue: 'Join Request' },
                            { key: 'CONTACT_REQUEST', displayValue: 'Contact Request' },
                            { key: 'DONATION_REQUEST', displayValue: 'Donation Request' }
                        ],
                        cssInputClass: 'bg-white'
                    }
                }
            ]
        }
    };
};

export const taskSearchInput = (
    tab: workListTab,
    refData: {
        [name: string]: any[];
    }
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search tasks...',
        advancedSearch: {
            searchFormFields: []
        }
    };
};
