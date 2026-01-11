import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { NoticeConstant } from "../communication.const";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { Notice } from "../model/notice.model";

/**
 * Notice fields configuration
 */

export const noticeSearchInput = (
    refData: {
        [name: string]: any[];
    }
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search notices...',
        advancedSearch: {
            title: 'Advanced Notice Search',
            buttonText: {
                search: 'Search Notices',
                close: 'Clear & Close'
            },
            searchFormFields: [
                // Add search form fields here later
            ]
        }
    };
};

/**
 * Notice header row for accordion
 */
export const noticeHeader: any[] = [
    {
        value: 'Notice Title',
        rounded: true
    },
    {
        value: 'Notice Date',
        rounded: true
    },
    {
        value: 'Status',
        rounded: true
    },
    {
        value: 'Has Meeting',
        rounded: true
    }
];

/**
 * Get notice detail section for detailed view
 */
export const getNoticeSection = (
    notice: Notice,
    refData: { [name: string]: KeyValue[] },
    isCreate: boolean = false,
): DetailedView => {
    return {
        section_name: 'Notice Details',
        section_type: 'key_value',
        section_html_id: 'notice_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Notice ID',
                field_value: notice?.id || '',
                hide_field: isCreate
            },
            {
                field_name: 'Title',
                field_value: notice?.title || '',
                editable: true,
                form_control_name: 'title',
                field_html_id: 'notice_title',
                form_input: {
                    html_id: 'notice_title',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter notice title'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Description',
                field_value: notice?.description || '',
                editable: true,
                form_control_name: 'description',
                field_html_id: 'notice_description',
                form_input: {
                    html_id: 'notice_description',
                    tagName: 'textarea',
                    inputType: 'text',
                    placeholder: 'Enter notice description'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Notice Date',
                field_value: notice?.noticeDate || '',
                field_display_value: date(notice?.noticeDate),
                editable: true,
                form_control_name: 'noticeDate',
                field_html_id: 'notice_date',
                form_input: {
                    html_id: 'notice_date',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Select notice date'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Status',
                field_value: notice?.noticeStatus,
                show_display_value: true,
                ref_data_section: NoticeConstant.refDataKey.statuses,
                editable: true,
                form_control_name: 'noticeStatus',
                field_html_id: 'notice_status',
                form_input: {
                    html_id: 'notice_status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select status',
                    selectList: refData?.[NoticeConstant.refDataKey.statuses] || []
                },
                form_input_validation: []
            },
            {
                field_name: 'Has Meeting',
                field_value: notice?.hasMeeting ? 'Yes' : 'No',
                hide_field: isCreate
            },
            {
                field_name: 'Created At',
                field_value: notice?.createdAt || '',
                field_display_value: date(notice?.createdAt),
                hide_field: isCreate
            },
            {
                field_name: 'Updated At',
                field_value: notice?.updatedAt || '',
                field_display_value: date(notice?.updatedAt),
                hide_field: isCreate
            }
        ]
    };
};
