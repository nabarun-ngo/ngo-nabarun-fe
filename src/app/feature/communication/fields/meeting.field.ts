import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { AgendaItem, Meeting, MeetingParticipant } from "../model/meeting.model";
import { timeRangeValidator } from "src/app/shared/utils/validator";
import { User } from "../../member/models/member.model";

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
                field_name: 'Meeting Summary',
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
            // {
            //     field_name: 'Meeting Description',
            //     field_value: meeting?.description || '',
            //     editable: true,
            //     form_control_name: 'description',
            //     field_html_id: 'meeting_description',
            //     form_input: {
            //         html_id: 'meeting_description',
            //         tagName: 'textarea',
            //         inputType: 'text',
            //         placeholder: 'Enter meeting description'
            //     },
            //     form_input_validation: []
            // },
            {
                field_name: 'Meeting Date',
                field_value: meeting?.startTime ? date(meeting.startTime, 'yyyy-MM-dd') : '',
                field_display_value: date(meeting?.startTime),
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
                field_name: 'Meeting Start Time',
                field_value: meeting?.startTime ? date(meeting.startTime, 'HH:mm') : '',
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
                field_name: 'Meeting End Time',
                field_value: meeting?.endTime ? date(meeting.endTime, 'HH:mm') : '',
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
                field_name: 'Meeting Location',
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
                field_name: 'Meeting Host Email',
                field_value: meeting?.hostEmail || '',
                hide_field: isCreate
            },
            {
                field_name: 'Meeting Status',
                field_value: meeting?.status,
                hide_field: !meeting?.status
            },
            {
                field_name: 'Meeting Link',
                field_value: meeting?.meetLink || '',
                field_display_value: `<a href="${meeting?.meetLink}" target="_blank">${meeting?.meetLink}</a>`,
                hide_field: !meeting?.meetLink || isCreate
            },
        ]
    };
};

export const getMeetingAttendeeSection = (
    meeting: Meeting,
    refData: { [name: string]: KeyValue[] },
    isCreate: boolean = false,
    users: User[] = []
): DetailedView => {
    const attendees: MeetingParticipant[] = meeting?.attendees ?? users.map(user => ({
        email: user.email,
        name: user.fullName,
    }));
    const userKv: KeyValue[] = users.map(user => ({
        key: user.email,
        displayValue: `${user.email} (${user.fullName})`,
    }));
    return {
        section_name: 'Meeting Attendees',
        section_type: 'editable_table',
        section_html_id: 'meeting_attendee',
        section_form: new FormGroup({
            attendees: new FormArray([
                ...attendees.map(item => new FormGroup({
                    email: new FormControl(item.email, [Validators.required, Validators.email]),
                    name: new FormControl(item.name, [Validators.required]),
                    attended: new FormControl(false),
                }))
            ])
        }),
        show_form: isCreate,
        editableTable: {
            formArrayName: 'attendees',
            columns: [
                {
                    hideInEditMode: true,
                    columnDef: 'name',
                    header: 'Name',
                    editable: false,
                    validators: [],
                    inputModel: {
                        html_id: 'meeting_attendee_name',
                        tagName: 'input',
                        inputType: 'text',
                        placeholder: 'Enter attendee name',
                    },
                },
                {
                    columnDef: 'email',
                    header: 'Email',
                    editable: true,
                    validators: [Validators.required, Validators.email],
                    inputModel: {
                        html_id: 'meeting_attendee_email',
                        tagName: 'input',
                        inputType: 'email',
                        placeholder: 'Enter attendee email',
                        autocomplete: true,
                        selectList: userKv
                    },
                },
                {
                    hideInEditMode: true,
                    columnDef: 'attended',
                    header: 'Attended Meeting?',
                    hideField: isCreate,
                    editable: !isCreate,
                    validators: [],
                    inputModel: {
                        html_id: 'attended',
                        tagName: 'input',
                        inputType: 'check',
                        placeholder: '',
                    },
                }
            ],
            allowAddRow: true,
            allowDeleteRow: true,
            allowDeleteAll: true,
            maxHeight: '400px',
            rowValidationRules: [
            ]
        }
    };
}


export const getMeetingNotesSection = (
    meeting: Meeting,
    refData: { [name: string]: KeyValue[] },
    isCreate: boolean = false,
): DetailedView => {
    const agendaItems: AgendaItem[] = meeting?.agenda ?? [];
    return {
        section_name: 'Meeting Agenda',
        section_type: 'editable_table',
        section_html_id: 'meeting_notes',
        section_form: new FormGroup({
            agenda: new FormArray([
                ...agendaItems.map(item => new FormGroup({
                    agenda: new FormControl(item.agenda, [Validators.required]),
                    outcomes: new FormControl(item.outcomes),
                }))
            ])
        }),
        show_form: isCreate,
        editableTable: {
            formArrayName: 'agenda',
            columns: [
                {
                    hideInEditMode: false,
                    columnDef: 'agenda',
                    header: 'Agenda',
                    editable: true,
                    validators: [Validators.required],
                    inputModel: {
                        html_id: 'meeting_agenda',
                        tagName: 'input',
                        inputType: 'text',
                        placeholder: 'Enter agenda item',
                    },
                },
                {
                    hideInEditMode: isCreate,
                    columnDef: 'outcomes',
                    header: 'Outcomes',
                    editable: true,
                    validators: [],
                    inputModel: {
                        html_id: 'meeting_outcomes',
                        tagName: 'input',
                        inputType: 'text',
                        placeholder: 'Enter outcomes',
                    },
                }
            ],
            allowAddRow: true,
            allowDeleteRow: true,
            maxHeight: '400px',
        }
    };
}

