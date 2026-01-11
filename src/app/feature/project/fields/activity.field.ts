import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { ActivityConstant } from "../project.const";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { ProjectActivity } from "../model/activity.model";

/**
 * Activity fields configuration
 */

export const activitySearchInput = (
    refData: {
        [name: string]: any[];
    }
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search activities...',
        advancedSearch: {
            title: 'Advanced Activity Search',
            buttonText: {
                search: 'Search Activities',
                close: 'Clear & Close'
            },
            searchFormFields: [
                // Add search form fields here later
            ]
        }
    };
};

/**
 * Activity header row for accordion
 */
export const activityHeader: any[] = [
    {
        value: 'Activity Name',
        rounded: true
    },
    {
        value: 'Type',
        rounded: true
    },
    {
        value: 'Status',
        rounded: true
    },
    {
        value: 'Activity Date',
        rounded: true
    }
];

/**
 * Get activity detail section for detailed view
 */
export const getActivitySection = (
    activity: ProjectActivity,
    refData: { [name: string]: KeyValue[] },
    isCreate: boolean = false,
): DetailedView => {
    return {
        section_name: 'Activity Details',
        section_type: 'key_value',
        section_html_id: 'activity_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Activity Name',
                field_value: activity?.name || '',
                editable: true,
                form_control_name: 'name',
                field_html_id: 'activity_name',
                form_input: {
                    html_id: 'activity_name',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter activity name'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Description',
                field_value: activity?.description || '',
                editable: true,
                form_control_name: 'description',
                field_html_id: 'activity_description',
                form_input: {
                    html_id: 'activity_description',
                    tagName: 'textarea',
                    inputType: 'text',
                    placeholder: 'Enter activity description'
                },
                form_input_validation: []
            },
            {
                field_name: 'Type',
                field_value: activity?.type,
                show_display_value: true,
                ref_data_section: ActivityConstant.refDataKey.types,
                editable: true,
                form_control_name: 'type',
                field_html_id: 'activity_type',
                form_input: {
                    html_id: 'activity_type',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select activity type',
                    selectList: refData?.[ActivityConstant.refDataKey.types] || []
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Status',
                field_value: activity?.status,
                show_display_value: true,
                ref_data_section: ActivityConstant.refDataKey.statuses,
                editable: true,
                form_control_name: 'status',
                field_html_id: 'activity_status',
                form_input: {
                    html_id: 'activity_status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select status',
                    selectList: refData?.[ActivityConstant.refDataKey.statuses] || []
                },
                form_input_validation: []
            },
            {
                field_name: 'Priority',
                field_value: activity?.priority,
                show_display_value: true,
                ref_data_section: ActivityConstant.refDataKey.priorities,
                editable: true,
                form_control_name: 'priority',
                field_html_id: 'activity_priority',
                form_input: {
                    html_id: 'activity_priority',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select priority',
                    selectList: refData?.[ActivityConstant.refDataKey.priorities] || []
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Start Date',
                field_value: activity?.startDate || '',
                field_display_value: activity?.startDate ? date(activity?.startDate) : undefined,
                editable: true,
                form_control_name: 'startDate',
                field_html_id: 'activity_start_date',
                form_input: {
                    html_id: 'activity_start_date',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Select start date'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'End Date',
                field_value: activity?.endDate || '',
                field_display_value: activity?.endDate ? date(activity?.endDate) : undefined,
                editable: true,
                form_control_name: 'endDate',
                field_html_id: 'activity_end_date',
                form_input: {
                    html_id: 'activity_end_date',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Select end date'
                },
                form_input_validation: []
            },
            {
                field_name: 'Actual Start Date',
                field_value: activity?.actualStartDate,
                field_display_value: date(activity?.actualStartDate),
                hide_field: !activity?.actualStartDate || isCreate
            },
            {
                field_name: 'Actual End Date',
                field_value: activity?.actualEndDate,
                field_display_value: date(activity?.actualEndDate),
                hide_field: !activity?.actualEndDate || isCreate
            },
            {
                field_name: 'Location',
                field_value: activity?.location || '',
                editable: true,
                form_control_name: 'location',
                field_html_id: 'activity_location',
                form_input: {
                    html_id: 'activity_location',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter location'
                },
                form_input_validation: []
            },
            {
                field_name: 'Estimated Cost',
                field_value: activity?.estimatedCost ? `${activity.estimatedCost}` : undefined,
                field_display_value: activity?.estimatedCost && activity?.currency
                    ? `${activity.currency} ${activity.estimatedCost.toLocaleString('en-IN')}`
                    : undefined,
                editable: true,
                form_control_name: 'estimatedCost',
                field_html_id: 'activity_estimated_cost',
                form_input: {
                    html_id: 'activity_estimated_cost',
                    tagName: 'input',
                    inputType: 'number',
                    placeholder: 'Enter estimated cost'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Currency',
                field_value: activity?.currency || 'INR',
                editable: true,
                form_control_name: 'currency',
                field_html_id: 'activity_currency',
                form_input: {
                    html_id: 'activity_currency',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter currency (e.g., INR)'
                },
                form_input_validation: []
            },
            {
                field_name: 'Actual Cost',
                field_value: activity?.actualCost ? `${activity.actualCost}` : undefined,
                field_display_value: activity?.actualCost && activity?.currency
                    ? `${activity.currency} ${activity.actualCost.toLocaleString('en-IN')}`
                    : undefined,
                hide_field: !activity?.actualCost || isCreate
            },
            {
                field_name: 'Expected Participants',
                field_value: activity?.expectedParticipants ? `${activity.expectedParticipants}` : undefined,
                editable: true,
                form_control_name: 'expectedParticipants',
                field_html_id: 'activity_expected_participants',
                form_input: {
                    html_id: 'activity_expected_participants',
                    tagName: 'input',
                    inputType: 'number',
                    placeholder: 'Enter expected participants'
                },
                form_input_validation: []
            },
            {
                field_name: 'Actual Participants',
                field_value: activity?.actualParticipants ? `${activity.actualParticipants}` : undefined,
                hide_field: !activity?.actualParticipants || isCreate
            },
            {
                field_name: 'Created At',
                field_value: activity?.createdAt || '',
                field_display_value: date(activity?.createdAt),
                hide_field: isCreate
            }
        ]
    };
};
