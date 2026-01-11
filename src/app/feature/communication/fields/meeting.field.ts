import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { MeetingConstant } from "../communication.const";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { Meeting } from "../model/meeting.model";

/**
 * Meeting fields configuration
 */

export const meetingSearchInput = (
    refData: {
        [name: string]: any[];
    }
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search meetings...',
        advancedSearch: {
            title: 'Advanced Meeting Search',
            buttonText: {
                search: 'Search Meetings',
                close: 'Clear & Close'
            },
            searchFormFields: [
                // Add search form fields here later
            ]
        }
    };
};

/**
 * Meeting header row for accordion
 */
export const meetingHeader: any[] = [
    {
        value: 'Meeting Summary',
        rounded: true
    },
    {
        value: 'Type',
        rounded: true
    },
    {
        value: 'Date',
        rounded: true
    },
    {
        value: 'Time',
        rounded: true
    },
    {
        value: 'Status',
        rounded: true
    }
];

/**
 * Get meeting detail section for detailed view
 */
export const getMeetingSection = (
    meeting: Meeting,
    refData: { [name: string]: KeyValue[] },
    isCreate: boolean = false,
): DetailedView => {
    return {
        section_name: 'Meeting Details',
        section_type: 'key_value',
        section_html_id: 'meeting_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Meeting ID',
                field_value: meeting?.id || '',
                hide_field: isCreate
            },
            {
                field_name: 'Meeting Summary',
                field_value: meeting?.meetingSummary || '',
                editable: true,
                form_control_name: 'meetingSummary',
                field_html_id: 'meeting_summary',
                form_input: {
                    html_id: 'meeting_summary',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter meeting summary'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Description',
                field_value: meeting?.meetingDescription || '',
                editable: true,
                form_control_name: 'meetingDescription',
                field_html_id: 'meeting_description',
                form_input: {
                    html_id: 'meeting_description',
                    tagName: 'textarea',
                    inputType: 'text',
                    placeholder: 'Enter meeting description'
                },
                form_input_validation: []
            },
            {
                field_name: 'Meeting Type',
                field_value: meeting?.meetingType,
                show_display_value: true,
                ref_data_section: MeetingConstant.refDataKey.types,
                editable: true,
                form_control_name: 'meetingType',
                field_html_id: 'meeting_type',
                form_input: {
                    html_id: 'meeting_type',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select meeting type',
                    selectList: refData?.[MeetingConstant.refDataKey.types] || []
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Meeting Date',
                field_value: meeting?.meetingDate || '',
                field_display_value: date(meeting?.meetingDate),
                editable: true,
                form_control_name: 'meetingDate',
                field_html_id: 'meeting_date',
                form_input: {
                    html_id: 'meeting_date',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Select meeting date'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Start Time',
                field_value: meeting?.meetingStartTime || '',
                editable: true,
                form_control_name: 'meetingStartTime',
                field_html_id: 'meeting_start_time',
                form_input: {
                    html_id: 'meeting_start_time',
                    tagName: 'input',
                    inputType: 'time',
                    placeholder: 'Select start time'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'End Time',
                field_value: meeting?.meetingEndTime || '',
                editable: true,
                form_control_name: 'meetingEndTime',
                field_html_id: 'meeting_end_time',
                form_input: {
                    html_id: 'meeting_end_time',
                    tagName: 'input',
                    inputType: 'time',
                    placeholder: 'Select end time'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Location',
                field_value: meeting?.meetingLocation || '',
                editable: true,
                form_control_name: 'meetingLocation',
                field_html_id: 'meeting_location',
                form_input: {
                    html_id: 'meeting_location',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter meeting location'
                },
                form_input_validation: []
            },
            {
                field_name: 'Status',
                field_value: meeting?.meetingStatus,
                show_display_value: true,
                ref_data_section: MeetingConstant.refDataKey.statuses,
                editable: true,
                form_control_name: 'meetingStatus',
                field_html_id: 'meeting_status',
                form_input: {
                    html_id: 'meeting_status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select status',
                    selectList: refData?.[MeetingConstant.refDataKey.statuses] || []
                },
                form_input_validation: []
            },
            {
                field_name: 'Video Conference Link',
                field_value: meeting?.extVideoConferenceLink || '',
                hide_field: !meeting?.extVideoConferenceLink || isCreate
            },
            {
                field_name: 'Meeting Link',
                field_value: meeting?.extHtmlLink || '',
                hide_field: !meeting?.extHtmlLink || isCreate
            }
        ]
    };
};
