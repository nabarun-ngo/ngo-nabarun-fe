import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { Meeting } from "../model/meeting.model";
import { timeRangeValidator } from "src/app/shared/utils/validator";

const meetingTimeList: KeyValue[] = [
    {
        key: '00:00',
        displayValue: '00:00 AM'
    },
    {
        key: '00:30',
        displayValue: '00:30 AM'
    },
    {
        key: '01:00',
        displayValue: '01:00 AM'
    },
    {
        key: '01:30',
        displayValue: '01:30 AM'
    },
    {
        key: '02:00',
        displayValue: '02:00 AM'
    },
    {
        key: '02:30',
        displayValue: '02:30 AM'
    },
    {
        key: '03:00',
        displayValue: '03:00 AM'
    },
    {
        key: '03:30',
        displayValue: '03:30 AM'
    },
    {
        key: '04:00',
        displayValue: '04:00 AM'
    },
    {
        key: '04:30',
        displayValue: '04:30 AM'
    },
    {
        key: '05:00',
        displayValue: '05:00 AM'
    },
    {
        key: '05:30',
        displayValue: '05:30 AM'
    },
    {
        key: '06:00',
        displayValue: '06:00 AM'
    },
    {
        key: '06:30',
        displayValue: '06:30 AM'
    },
    {
        key: '07:00',
        displayValue: '07:00 AM'
    },
    {
        key: '07:30',
        displayValue: '07:30 AM'
    },
    {
        key: '08:00',
        displayValue: '08:00 AM'
    },
    {
        key: '08:30',
        displayValue: '08:30 AM'
    },
    {
        key: '09:00',
        displayValue: '09:00 AM'
    },
    {
        key: '09:30',
        displayValue: '09:30 AM'
    },
    {
        key: '10:00',
        displayValue: '10:00 AM'
    },
    {
        key: '10:30',
        displayValue: '10:30 AM'
    },
    {
        key: '11:00',
        displayValue: '11:00 AM'
    },
    {
        key: '11:30',
        displayValue: '11:30 AM'
    },
    {
        key: '12:00',
        displayValue: '12:00 PM'
    },
    {
        key: '12:30',
        displayValue: '12:30 PM'
    },
    {
        key: '13:00',
        displayValue: '01:00 PM'
    },
    {
        key: '13:30',
        displayValue: '01:30 PM'
    },
    {
        key: '14:00',
        displayValue: '02:00 PM'
    },
    {
        key: '14:30',
        displayValue: '02:30 PM'
    },
    {
        key: '15:00',
        displayValue: '03:00 PM'
    },
    {
        key: '15:30',
        displayValue: '03:30 PM'
    },
    {
        key: '16:00',
        displayValue: '04:00 PM'
    },
    {
        key: '16:30',
        displayValue: '04:30 PM'
    },
    {
        key: '17:00',
        displayValue: '05:00 PM'
    },
    {
        key: '17:30',
        displayValue: '05:30 PM'
    },
    {
        key: '18:00',
        displayValue: '06:00 PM'
    },
    {
        key: '18:30',
        displayValue: '06:30 PM'
    },
    {
        key: '19:00',
        displayValue: '07:00 PM'
    },
    {
        key: '19:30',
        displayValue: '07:30 PM'
    },
    {
        key: '20:00',
        displayValue: '08:00 PM'
    },
    {
        key: '20:30',
        displayValue: '08:30 PM'
    },
    {
        key: '21:00',
        displayValue: '09:00 PM'
    },
    {
        key: '21:30',
        displayValue: '09:30 PM'
    },
    {
        key: '22:00',
        displayValue: '10:00 PM'
    },
    {
        key: '22:30',
        displayValue: '10:30 PM'
    },
    {
        key: '23:00',
        displayValue: '11:00 PM'
    },
    {
        key: '23:30',
        displayValue: '11:30 PM'
    }
];

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
        value: 'Meeting Date',
        rounded: true
    },
    {
        value: 'Meeting Time',
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
        section_form: new FormGroup({}, { validators: timeRangeValidator }),
        content: [
            {
                field_name: 'Summary',
                field_value: meeting?.summary || '',
                editable: true,
                form_control_name: 'summary',
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
                field_name: 'Meeting Type',
                field_value: meeting?.type,
                editable: isCreate,
                form_control_name: 'type',
                field_html_id: 'meeting_type',
                form_input: {
                    html_id: 'meeting_type',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select meeting type',
                    selectList: [
                        {
                            key: 'ONLINE',
                            displayValue: 'Online'
                        },
                        {
                            key: 'OFFLINE',
                            displayValue: 'In Person'
                        }
                    ]
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Description',
                field_value: meeting?.description || '',
                editable: true,
                form_control_name: 'description',
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
                field_name: 'Meeting Date',
                field_value: meeting?.startTime || '',
                field_display_value: date(meeting?.startTime),
                editable: true,
                form_control_name: 'date',
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
                field_value: date(meeting?.startTime, 'HH:mm'),
                field_display_value: date(meeting?.startTime, 'hh:mm a'),
                editable: true,
                form_control_name: 'startTime',
                field_html_id: 'meeting_start_time',
                form_input: {
                    html_id: 'meeting_start_time',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select start time',
                    selectList: meetingTimeList
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'End Time',
                field_value: date(meeting?.endTime, 'HH:mm'),
                field_display_value: date(meeting?.endTime, 'hh:mm a'),
                editable: true,
                form_control_name: 'endTime',
                field_html_id: 'meeting_end_time',
                form_input: {
                    html_id: 'meeting_end_time',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select end time',
                    selectList: meetingTimeList
                },
                form_input_validation: isCreate ? [Validators.required, timeRangeValidator] : []
            },
            {
                field_name: 'Location',
                field_value: meeting?.location || '',
                editable: true,
                form_control_name: 'location',
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
                field_name: 'Attendees',
                field_value: meeting?.attendees?.map((attendee) => attendee.email).join(',') || '',
                field_value_splitter: ',',
                field_display_value: meeting?.attendees?.map((attendee) => `${attendee.name} (${attendee.email})`).join('<br>') || '',
                editable: true,
                form_control_name: 'attendees',
                field_html_id: 'attendees',
                form_input: {
                    html_id: 'attendees',
                    tagName: 'select',
                    inputType: 'multiselect',
                    placeholder: 'Select attendees',
                    selectList: []
                },
                form_input_validation: []
            },
            {
                field_name: 'Status',
                field_value: meeting?.status,
                hide_field: !meeting?.status
            },
            {
                field_name: 'Meeting Link',
                field_value: meeting?.meetLink || '',
                hide_field: !meeting?.meetLink || isCreate
            }
        ]
    };
};
