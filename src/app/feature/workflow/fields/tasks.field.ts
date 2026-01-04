import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { Task } from "../model/task.model";
import { WorkflowConstant, workListTab } from "../workflow.const";
import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";

export const getTaskDetailSection = (m: Task, tab: workListTab): DetailedView => {
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
                ref_data_section: WorkflowConstant.refDataKey.workflowTaskStatuses,
            },
            {
                field_name: 'Assigned To',
                field_html_id: 'assigned_to',
                field_value: m.assignments?.map(x => x.assignedToName).join(', '),
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
            {
                field_name: 'Failure Reason',
                field_html_id: 'failure_reason',
                field_value: m.failureReason!,
                hide_field: !m.failureReason || tab == 'pending_worklist',
            },
        ]
    };
}

export const getTaskActionDetailSection = (m: Task): DetailedView => {
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