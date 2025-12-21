import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { DonationRefData, donationTab } from "../finance.const";
import { Doc } from "src/app/shared/model/document.model";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { Donation } from "../model";
import { EventEmitter } from "@angular/core";
import { User } from "../../member/models/member.model";


export const donationSearchInput = (
    tab: donationTab,
    refData: {
        [name: string]: KeyValue[];
    }
): SearchAndAdvancedSearchModel => {

    return {
        normalSearchPlaceHolder: 'Search by Donation ID, Type, Status, Date',
        advancedSearch: {
            title: 'Advanced Donation Search',
            buttonText: {
                search: 'Search',
                close: 'Close'
            },
            searchFormFields: [
                {
                    formControlName: 'donationId',
                    inputModel: {
                        tagName: 'input',
                        inputType: 'text',
                        html_id: 'donationId',
                        labelName: 'Donation Number',
                        placeholder: 'Enter Donation Number',
                        cssInputClass: 'bg-white'
                    }
                },
                {
                    formControlName: 'donationType',
                    inputModel: {
                        tagName: 'select',
                        inputType: 'multiselect',
                        html_id: 'donationType',
                        labelName: 'Donation Type',
                        placeholder: 'Select Donation Type',
                        selectList: refData?.[DonationRefData.refDataKey.type] || [],
                        cssInputClass: 'bg-white'
                    }
                },
                {
                    formControlName: 'donationStatus',
                    inputModel: {
                        tagName: 'select',
                        inputType: 'multiselect',
                        html_id: 'donationStatus',
                        labelName: 'Donation Status',
                        placeholder: 'Select Status',
                        selectList: refData?.[DonationRefData.refDataKey.status] || [],
                        cssInputClass: 'bg-white'
                    }
                },
                {
                    formControlName: 'startDate',
                    inputModel: {
                        tagName: 'input',
                        inputType: 'date',
                        html_id: 'fromDate',
                        labelName: 'From Date',
                        placeholder: 'Select from date',
                        cssInputClass: 'bg-white'
                    }
                },
                {
                    formControlName: 'endDate',
                    inputModel: {
                        tagName: 'input',
                        inputType: 'date',
                        html_id: 'toDate',
                        labelName: 'To Date',
                        placeholder: 'Select to date',
                        cssInputClass: 'bg-white'
                    }
                },

            ]
        }
    };
};
export const getDonationSection = (
    donation: Donation,
    options: {
        mode: 'create' | 'edit' | 'view',
        refData?: { [name: string]: KeyValue[] },
        payableAccounts?: KeyValue[],
        events?: KeyValue[]
    }
): DetailedView => {
    const { mode, refData, payableAccounts = [], events = [] } = options;
    const donationForm = new FormGroup({
    })
    const STATUS = refData?.[DonationRefData.refDataKey.status] || [];
    const NEXT_STATUS = STATUS.filter((status) => donation.nextStatuses?.includes(status.key)) || [];
    return {
        section_name: 'Donation Details',
        section_type: 'key_value',
        section_html_id: 'donation_detail',
        section_form: donationForm,
        content: [
            {
                field_name: 'Donation number',
                field_value: donation?.id || '',
                hide_field: mode === 'create'
            },
            {
                field_name: 'Donation type',
                field_value: donation?.type || '',
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.type,
                editable: mode === 'create' || mode === 'edit',
                form_control_name: 'type',
                form_input: {
                    html_id: 'type',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. Regular',
                    selectList: refData?.[DonationRefData.refDataKey.type] || []
                }
            },
            {
                field_name: 'Donation amount',
                field_value: `${donation.amount}`,
                field_display_value: `₹ ${donation.amount}`,
                editable: mode === 'create' || mode === 'edit',
                form_control_name: 'amount',
                form_input: {
                    html_id: 'amount',
                    tagName: 'input',
                    inputType: 'number',
                    placeholder: 'Ex. 100'
                }
            },
            {
                field_name: 'Donation status',
                field_value: donation?.status || '',
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.status,
                hide_field: mode === 'create',
                editable: mode === 'edit',
                form_control_name: 'status',
                form_input: {
                    html_id: 'status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. Paid',
                    selectList: NEXT_STATUS
                }
            },
            {
                field_name: 'Donation start date',
                field_value: donation?.startDate || '',
                field_display_value: date(donation?.startDate),
                hide_field: !(
                    (mode === 'create' && donation?.type === 'REGULAR') ||
                    (mode === 'edit' && donation?.type === 'REGULAR') ||
                    (mode === 'view' && donation?.type === 'REGULAR')
                ),
                editable: mode === 'create' || mode === 'edit',
                form_control_name: 'startDate',
                form_input: {
                    html_id: 'startDate',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Ex. 01/01/2024',
                    style: 'width: 212px;'
                }
            },
            {
                field_name: 'Donation end date',
                field_value: donation?.endDate || '',
                field_display_value: date(donation?.endDate),
                hide_field: !(
                    (mode === 'create' && donation?.type === 'REGULAR') ||
                    (mode === 'edit' && donation?.type === 'REGULAR') ||
                    (mode === 'view' && donation?.type === 'REGULAR')
                ),
                editable: mode === 'create' || mode === 'edit',
                form_control_name: 'endDate',
                form_input: {
                    html_id: 'endDate',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Ex. 01/31/2024',
                    style: 'width: 212px;'
                }
            },
            {
                field_name: 'Donation raised on',
                field_value: donation?.raisedOn || '',
                field_display_value: date(donation?.raisedOn),
                hide_field: mode === 'create'
            },
            {
                field_name: 'Donation paid on',
                field_value: donation?.paidOn || '',
                field_display_value: date(donation?.paidOn),
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAID') ||
                    (mode === 'edit' && donation?.status === 'PAID')
                ),
                editable: mode === 'edit',
                form_control_name: 'paidOn',
                form_input: {
                    html_id: 'paidOn',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Ex. 01/15/2024',
                    style: 'width: 212px;'
                }
            },
            {
                field_name: 'Donation paid to',
                field_value: donation?.paidToAccount?.accountHolderName
                    ? `${donation.paidToAccount.accountHolderName}${donation.paidToAccount.id ? ` (${donation.paidToAccount.id})` : ''}`
                    : '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAID') ||
                    (mode === 'edit' && donation?.status === 'PAID')
                ),
                editable: mode === 'edit',
                form_control_name: 'paidToAccount',
                form_input: {
                    html_id: 'paidToAccount',
                    tagName: 'select',
                    inputType: '',
                    selectList: payableAccounts
                }
            },
            {
                field_name: 'Payment method',
                field_value: donation?.paymentMethod || '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAID') ||
                    (mode === 'edit' && donation?.status === 'PAID')
                ),
                editable: mode === 'edit',
                form_control_name: 'paymentMethod',
                form_input: {
                    html_id: 'paymentMethod',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. UPI',
                    selectList: refData?.[DonationRefData.refDataKey.paymentMethod] || []
                }
            },
            {
                field_name: 'UPI name',
                field_value: donation?.paidUsingUPI || '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAID' && donation?.paymentMethod === 'UPI') ||
                    (mode === 'edit' && donation?.status === 'PAID' && donation?.paymentMethod === 'UPI')
                ),
                editable: mode === 'edit',
                form_control_name: 'paidUsingUPI',
                form_input: {
                    html_id: 'paidUsingUPI',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. UPI',
                    selectList: refData?.[DonationRefData.refDataKey.upiOps] || []
                }
            },
            {
                field_name: 'Donation confirmed by',
                field_value: donation?.confirmedBy?.fullName || '',
                hide_field: !(mode === 'view' && donation?.status === 'PAID')
            },
            {
                field_name: 'Donation confirmed on',
                field_value: donation?.confirmedOn || '',
                field_display_value: date(donation?.confirmedOn),
                hide_field: !(mode === 'view' && donation?.status === 'PAID')
            },
            {
                field_name: 'Remarks',
                field_value: donation?.remarks || '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAID') ||
                    (mode === 'edit' && donation?.status === 'PAID')
                ),
                editable: mode === 'edit',
                form_control_name: 'remarks',
                form_input: {
                    html_id: 'remarks',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Remarks'
                }
            },
            {
                field_name: 'Reason for cancel',
                field_value: donation?.cancelletionReason || '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'CANCELLED') ||
                    (mode === 'edit' && donation?.status === 'CANCELLED')
                ),
                editable: mode === 'edit',
                form_control_name: 'cancellationReason',
                form_input: {
                    html_id: 'cancellationReason',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Cancellation reason'
                }
            },
            {
                field_name: 'Reason for paying later',
                field_value: donation?.laterPaymentReason || '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAY_LATER') ||
                    (mode === 'edit' && donation?.status === 'PAY_LATER')
                ),
                editable: mode === 'edit',
                form_control_name: 'laterPaymentReason',
                form_input: {
                    html_id: 'laterPaymentReason',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Reason'
                }
            },
            {
                field_name: 'Payment failure details',
                field_value: donation?.paymentFailureDetail || '',
                hide_field: !(
                    (mode === 'view' && donation?.status === 'PAYMENT_FAILED') ||
                    (mode === 'edit' && donation?.status === 'PAYMENT_FAILED')
                ),
                editable: mode === 'edit',
                form_control_name: 'paymentFailureDetail',
                form_input: {
                    html_id: 'paymentFailureDetail',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Failure details'
                }
            },
            {
                field_name: 'Is this donation made for any events?',
                field_value: donation?.forEvent ? 'Yes' : 'No',
                hide_field: !(mode === 'create' && donation?.type === 'ONETIME'),
                editable: mode === 'create',
                form_control_name: 'isForEvent',
                form_input: {
                    html_id: 'isForEvent',
                    tagName: 'input',
                    inputType: 'radio',
                    selectList: [
                        { key: 'true', displayValue: 'Yes' },
                        { key: 'false', displayValue: 'No' }
                    ]
                }
            },
            {
                field_name: 'Select event',
                field_value: donation?.forEvent || '',
                hide_field: !(
                    mode === 'create' &&
                    donation?.type === 'ONETIME'
                    //  && donation?.forEvent === true
                ),
                editable: mode === 'create',
                form_control_name: 'eventId',
                form_input: {
                    html_id: 'eventId',
                    tagName: 'select',
                    inputType: '',
                    selectList: events
                }
            }
        ]
    };
};

export const getDonorSection = (
    donation: Donation,
    options: {
        mode: 'create' | 'edit' | 'view',
        refData?: { [name: string]: KeyValue[] }
    }
): DetailedView => {
    const { mode, refData } = options;

    return {
        section_name: 'Donor Details',
        section_type: 'key_value',
        section_html_id: 'donor_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Donor name',
                field_value: donation?.donorName!,
                form_control_name: 'donorName',
                editable: true,
                form_input: {
                    html_id: 'donorName',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Ex. John Doe',
                },
                field_html_id: 'donorName',
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Donor email',
                field_value: donation?.donorEmail!,
                form_control_name: 'donorEmail',
                editable: true,
                form_input: {
                    html_id: 'donorEmail',
                    tagName: 'input',
                    inputType: 'email',
                    placeholder: 'Ex. john.doe@gmail.com',
                },
                field_html_id: 'email',
                form_input_validation: []
            },
            {
                field_name: 'Phone Number',
                field_value: donation.donorPhone!,
                form_control_name: 'donorPhone',
                editable: true,
                form_input: {
                    html_id: 'donorPhone',
                    tagName: 'input',
                    inputType: 'phone',
                    placeholder: 'Ex. +91 1234567890'
                },
                field_html_id: 'primaryNumber',
                form_input_validation: []
            },
        ]
    };
};

export const donationDocumentSection = (
    docs: Doc[]
) => {
    return {
        section_name: 'Documents',
        section_type: 'doc_list',
        section_html_id: 'document_list',
        section_form: new FormGroup({}),
        documents: docs,
        form_alerts: [
            {
                data: {
                    alertType: 'info',
                    message: 'Please upload the screenshot of the donation transfer'
                }
            }
        ],
        doc: {
            docChange: new EventEmitter(),
        },
    } as DetailedView;
};
