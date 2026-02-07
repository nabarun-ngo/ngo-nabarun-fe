import { DetailedView, DetailedViewField } from "src/app/shared/model/detailed-view.model";
import { Task } from "../model/task.model";
import { WorkflowConstant, workListTab } from "../workflow.const";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { FieldAttributeDto } from "src/app/core/api-client/models";

export const getTaskDetailSection = (m: Task, tab: workListTab, refData: { [name: string]: KeyValue[]; }): DetailedView => {
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
                field_name: 'Task Type',
                field_html_id: 'work_type',
                field_value: m.type!,
                show_display_value: true,
                ref_data_section: WorkflowConstant.refDataKey.workflowTaskTypes,
            },
            {
                field_name: 'Task Name',
                field_html_id: 'work_name',
                field_value: m.name!,
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
                field_name: 'Task Status',
                field_html_id: 'status',
                field_value: m.status,
                show_display_value: true,
                ref_data_section: WorkflowConstant.refDataKey.visibleTaskStatuses,
                editable: true,
                form_control_name: 'status',
                form_input: {
                    tagName: 'select',
                    inputType: '',
                    html_id: 'status',
                    placeholder: 'Select status',
                    selectList: refData[WorkflowConstant.refDataKey.completedTaskStatuses]
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Assigned To',
                field_html_id: 'assigned_to',
                field_value: m.assignments?.map(x => `${x.assignedToName} (${x.status})`).join(', '),
                hide_field: !!m.assignedToId
            },
            {
                field_name: 'Accepted By',
                field_html_id: 'accepted_by',
                field_value: m.assignedToName,
                hide_field: !m.assignedToId
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
            {
                field_name: 'Remarks',
                field_html_id: 'remarks',
                field_value: m.remarks!,
                editable: true,
                form_control_name: 'remarks',
                form_input: {
                    tagName: 'textarea',
                    inputType: 'text',
                    html_id: 'remarks',
                    placeholder: 'Enter remarks',
                },
                form_input_validation: []
            }
        ]
    };
}

export const getTaskAdditionalDataSection = (m: Task, fields: FieldAttributeDto[], isCreate: boolean = false): DetailedView => {
    return {
        section_name: 'Task Additional Data',
        section_type: 'key_value',
        section_html_id: 'additional_data',
        hide_section: !isCreate && (!m?.resultData || Object.keys(m?.resultData || {}).length == 0),
        section_form: new FormGroup({}),
        show_form: isCreate,
        content: fields.map(field => ({
            editable: true,
            field_name: field.value,
            field_html_id: field.key,
            field_value: m?.resultData ? m?.resultData[field.key] : undefined,
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
            form_input_validation: field.isMandatory ? [Validators.required] : [],
        }) as DetailedViewField)
    };
}

export const getTaskCheckListSection = (m: Task, tab: workListTab): DetailedView => {
    return {
        section_name: 'To Do List',
        section_type: 'editable_list',
        section_html_id: 'todos',
        show_form: false,
        section_form: new FormGroup({
            todos: new FormArray(m.checklist?.map(x => new FormGroup({
                task: new FormControl(x)
            })) || [])
        }),
        editableList: {
            formArrayName: 'todos',
            itemFields: [
                {
                    field_html_id: 'task',
                    field_value: '',
                    form_control_name: 'task',
                    editable: false,
                },
            ],
            allowAddRow: false,
            allowDeleteRow: false,

        }

    };
}


export const taskSearchInput = (
    tab: workListTab,
    refData: {
        [name: string]: any[];
    }
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search by Task Id, Workflow Id, or Task Type...',
        advancedSearch: {
            searchFormFields: [
                {
                    formControlName: 'taskId',
                    inputModel: {
                        tagName: 'input',
                        inputType: 'text',
                        html_id: 'taskId',
                        labelName: 'Task ID',
                        placeholder: 'Enter Task ID',
                        cssInputClass: 'bg-white'
                    },
                },
                {
                    formControlName: 'workflowId',
                    inputModel: {
                        tagName: 'input',
                        inputType: 'text',
                        html_id: 'workflowId',
                        labelName: 'Workflow ID',
                        placeholder: 'Enter Workflow ID',
                        cssInputClass: 'bg-white'
                    },

                },
                {
                    formControlName: 'type',
                    inputModel: {
                        tagName: 'select',
                        inputType: 'multiselect',
                        html_id: 'type',
                        labelName: 'Task Type',
                        placeholder: 'Select Task Type',
                        selectList: refData[WorkflowConstant.refDataKey.workflowTaskTypes] || [],
                        cssInputClass: 'bg-white'
                    },

                },

            ]
        }
    };
};


