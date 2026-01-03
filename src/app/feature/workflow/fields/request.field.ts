import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { requestTab, WorkflowConstant, workListTab } from "../workflow.const";
import { DetailedView, DetailedViewField } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { WorkflowRequest } from "../model/request.model";
import { Task } from "../model/task.model";
import { DocumentDto } from "src/app/core/api-client/models";
import { Doc, mapDocDtoToDoc } from "src/app/shared/model/document.model";
import { KeyValue } from "src/app/shared/model/key-value.model";


export const getWorkDetailSection = (m: Task, tab: workListTab): DetailedView => {
    return {
        section_name: 'Task Details',
        section_type: 'key_value',
        section_html_id: 'work_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Task Id',
                field_html_id: 'work_id',
                field_value: m.id!
            },
            {
                field_name: 'Task Name',
                field_html_id: 'work_name',
                field_value: m.name!,
            },
            {
                field_name: 'Task Type',
                field_html_id: 'work_type',
                field_value: m.type!,
            },
            {
                field_name: 'Task Description',
                field_html_id: 'work_description',
                field_value: m.description!,
            },
            {
                field_name: 'Creation Date',
                field_html_id: 'creation_date',
                field_value: date(m.createdAt)
            },
            {
                field_name: 'Status',
                field_html_id: 'status',
                field_value: m.status,
            },
            {
                field_name: 'Assigned to',
                field_html_id: 'assigned_to',
                field_value: m.assignedToName || 'Unassigned',
                hide_field: tab == 'completed_worklist'
            },
            {
                field_name: 'Completed By',
                field_html_id: 'completed_by',
                field_value: m.completedByName!,
                hide_field: tab == 'pending_worklist'
            },
            {
                field_name: 'Completion Date',
                field_html_id: 'completion_date',
                field_value: date(m.completedAt),
                hide_field: tab == 'pending_worklist',
            },
        ]
    };
}

export const getWorkActionDetailSection = (m: Task): DetailedView => {
    // Basic action section for task completion
    return {
        section_name: 'Task Action Detail',
        section_type: 'key_value',
        section_html_id: 'action_details',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Remarks',
                field_html_id: 'remarks',
                form_control_name: 'remarks',
                field_value: '',
                editable: true,
                form_input: {
                    tagName: 'textarea',
                    inputType: 'text',
                    html_id: 'remarks',
                    placeholder: 'Enter remarks',
                },
                form_input_validation: [Validators.required]
            }
        ]

    };
}

export const getRequestDetailSection = (
    request: WorkflowRequest, refData: { [name: string]: KeyValue[]; }, isCreate: boolean = false, isDelegated: boolean = false): DetailedView => {
    console.log(refData)
    return {
        section_name: 'Request Detail',
        section_type: 'key_value',
        section_html_id: 'request_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Request Id',
                field_value: request?.id!,
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
                    selectList: []
                },
                form_input_validation: [Validators.required],
            },
            {
                field_name: 'Request Status',
                field_value: request?.status!,
                show_display_value: true,
                ref_data_section: WorkflowConstant.refDataKey.workflowStatuses,
            },
            {
                field_name: 'Request Description',
                field_value: request?.description!,
            },
            {
                field_name: 'Requested For',
                field_value: request?.initiatedForName!,
            },
            {
                field_name: 'Requested By',
                field_value: request?.initiatedByName!,
            },
            {
                field_name: 'Request Date',
                field_value: date(request?.createdAt!),
            },
            {
                field_name: 'Current Step',
                field_value: request?.steps.find((step) => step.stepId == request?.currentStepId)?.name!,
            },
            {
                field_name: 'Resolved On',
                field_value: date(request?.completedAt!),
                hide_field: !request?.completedAt
            },
            {
                field_name: 'Failure Reason',
                field_value: request?.failureReason!,
                hide_field: !request?.failureReason
            },
        ]
    };
}

export const getRequestAdditionalDetailSection = (m: WorkflowRequest): DetailedView => {
    return {
        section_name: 'Request Data',
        section_type: 'key_value',
        section_html_id: 'request_data',
        hide_section: !m.requestData || Object.keys(m.requestData).length === 0,
        section_form: new FormGroup({}),
        content: Object.keys(m.requestData || {}).map(key => ({
            field_name: key,
            field_value: typeof m.requestData[key] === 'object' ? JSON.stringify(m.requestData[key]) : m.requestData[key]
        }))
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
