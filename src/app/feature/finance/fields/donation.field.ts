import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { DonationRefData, donationTab } from "../finance.const";
import { Doc } from "src/app/shared/model/document.model";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { Donation } from "../model";
import { EventEmitter } from "@angular/core";
import { FieldVisibilityRule } from "src/app/shared/utils/accordion";
import { UniversalInputModel } from "src/app/shared/model/universal-input.model";


export const donationSearchInput = (
    tab: donationTab,
    refData: {
        [name: string]: KeyValue[];
    }
): SearchAndAdvancedSearchModel => {
    const showDonorName = tab === 'all_donation' || tab === 'guest_donation';
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
                ...(showDonorName ? [
                    {
                        formControlName: 'donorName',
                        inputModel: {
                            tagName: 'input',
                            inputType: 'text',
                            html_id: 'donorName',
                            labelName: 'Donor Name',
                            placeholder: 'Enter Donor Name',
                            cssInputClass: 'bg-white'
                        } as UniversalInputModel
                    }
                ] : [])

            ]
        }
    };
};
export const getDonationSection = (
    donation: Donation,
    refData: { [name: string]: KeyValue[] },
    payableAccounts: KeyValue[] = [],
    isCreate: boolean = false,
    isGuest: boolean = false,
): DetailedView => {
    const STATUS = refData?.[DonationRefData.refDataKey.status] || [];
    const NEXT_STATUS = STATUS.filter((status) => donation?.nextStatuses?.includes(status.key)) || [];
    return {
        section_name: 'Donation Details',
        section_type: 'key_value',
        section_html_id: 'donation_detail',
        section_form: new FormGroup({}),
        form_alerts: [],
        content: [
            {
                field_name: 'Donation number',
                field_value: donation?.id || '',
                hide_field: isCreate
            },
            {
                field_name: 'Donation type',
                field_value: isGuest ? 'ONETIME' : donation?.type,
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.type,
                editable: isCreate,
                hide_field: isCreate && isGuest,
                form_control_name: 'type',
                form_input: {
                    html_id: 'type',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. Regular',
                    selectList: refData?.[DonationRefData.refDataKey.type] || [],
                },
                field_html_id: 'type',
                form_input_validation: []
            },
            {
                field_name: 'Is this any project related Donation?',
                field_html_id: 'exp_is_event',
                field_value: undefined,
                hide_field: !isCreate,
                editable: isCreate,
                form_control_name: 'donationFor',
                form_input: {
                    html_id: 'donation_for_inp',
                    inputType: 'radio',
                    tagName: 'input',
                    placeholder: 'Ex. Lorem Ipsum',
                    selectList: [
                        { key: 'PROJECT', displayValue: 'Yes' },
                        { key: 'GENERAL', displayValue: 'No' },
                    ],
                },
                form_input_validation: [Validators.required],
            },
            {
                field_name: 'Donation amount',
                field_value: donation?.amount ? `${donation?.amount}` : undefined,
                field_display_value: `₹ ${donation?.amount}`,
                editable: isCreate || (!isCreate && donation?.status !== 'PAID'),
                form_control_name: 'amount',
                form_input: {
                    html_id: 'amount',
                    tagName: 'input',
                    inputType: 'number',
                    placeholder: 'Ex. 100'
                },
                field_html_id: 'amount',
                form_input_validation: []
            },
            {
                field_name: 'Donation status',
                field_value: donation?.status || '',
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.status,
                hide_field: isCreate,
                editable: !isCreate,
                form_control_name: 'status',
                form_input: {
                    html_id: 'status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. Paid',
                    selectList: NEXT_STATUS
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Donation start date',
                field_value: donation?.startDate || '',
                field_display_value: date(donation?.startDate),
                hide_field: !(donation?.type === 'REGULAR'),
                editable: true,
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
                hide_field: !(donation?.type === 'REGULAR'),
                editable: true,
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
                hide_field: isCreate
            },
            {
                field_name: 'Donation paid on',
                field_value: donation?.paidOn,
                field_display_value: date(donation?.paidOn),
                hide_field: !(
                    !isCreate && donation?.status === 'PAID'
                ),
                editable: !isCreate && donation?.status !== 'PAID',
                form_control_name: 'paidOn',
                form_input: {
                    html_id: 'paidOn',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Ex. 01/15/2024',
                    style: 'width: 212px;',
                }
            },
            {
                field_name: 'Donation paid to',
                field_value: donation?.paidToAccount?.id || '',
                hide_field: !(
                    !isCreate && donation?.status === 'PAID'
                ),
                editable: !isCreate && donation?.status !== 'PAID',
                form_control_name: 'paidToAccountId',
                form_input: {
                    html_id: 'paidToAccountId',
                    tagName: 'select',
                    inputType: '',
                    selectList: payableAccounts,
                    disabled: donation?.status === 'PAID'
                }
            },
            {
                field_name: 'Payment method',
                field_value: donation?.paymentMethod || '',
                hide_field: !(
                    !isCreate && donation?.status === 'PAID'
                ),
                editable: !isCreate && donation?.status !== 'PAID',
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.paymentMethod,
                form_control_name: 'paymentMethod',
                form_input: {
                    html_id: 'paymentMethod',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. UPI',
                    selectList: refData?.[DonationRefData.refDataKey.paymentMethod] || [],
                    disabled: donation?.status === 'PAID'
                }
            },
            {
                field_name: 'UPI name',
                field_value: donation?.paidUsingUPI || '',
                hide_field: !(
                    !isCreate && donation?.status === 'PAID' && donation?.paymentMethod === 'UPI'
                ),
                editable: !isCreate && donation?.status !== 'PAID',
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.upiOps,
                form_control_name: 'paidUsingUPI',
                form_input: {
                    html_id: 'paidUsingUPI',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. UPI',
                    selectList: refData?.[DonationRefData.refDataKey.upiOps] || [],
                    disabled: donation?.status === 'PAID'
                }
            },
            {
                field_name: 'Transaction Ref',
                field_value: donation?.transactionRef || '',
                hide_field: !(!isCreate && donation?.status === 'PAID')
            },
            {
                field_name: 'Donation confirmed by',
                field_value: donation?.confirmedBy?.fullName || '',
                hide_field: !(!isCreate && donation?.status === 'PAID')
            },
            {
                field_name: 'Donation confirmed on',
                field_value: donation?.confirmedOn || '',
                field_display_value: date(donation?.confirmedOn),
                hide_field: !(!isCreate && donation?.status === 'PAID')
            },
            {
                field_name: 'Remarks',
                field_value: donation?.remarks || '',
                hide_field: !(
                    !isCreate && donation?.status === 'PAID'
                ),
                editable: !isCreate,
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
                    !isCreate && donation?.status === 'CANCELLED'
                ),
                editable: !isCreate,
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
                    !isCreate && donation?.status === 'PAY_LATER'
                ),
                editable: !isCreate,
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
                    !isCreate && donation?.status === 'PAYMENT_FAILED'
                ),
                editable: !isCreate,
                form_control_name: 'paymentFailureDetail',
                form_input: {
                    html_id: 'paymentFailureDetail',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Failure details'
                }
            },

        ]
    };
};

export const getDonorSection = (
    donation: Partial<Donation>,
    options: {
        refData?: { [name: string]: KeyValue[] }
    }
): DetailedView => {
    const { refData } = options;

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
                form_input_validation: [Validators.email]
            },
            {
                field_name: 'Phone Number',
                field_value: donation?.donorPhone!,
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

export const DonationFieldVisibilityRules: FieldVisibilityRule<Donation>[] = [
    // Payment-related fields (show when status is PAID)
    {
        fieldName: 'paidOn',
        condition: (formValue) => formValue.status === 'PAID'
    },
    {
        fieldName: 'paidToAccountId',
        condition: (formValue) => formValue.status === 'PAID'
    },
    {
        fieldName: 'paymentMethod',
        condition: (formValue) => formValue.status === 'PAID'
    },
    {
        fieldName: 'remarks',
        condition: (formValue) => formValue.status === 'PAID'
    },
    // UPI field (show when status is PAID and payment method is UPI)
    {
        fieldName: 'paidUsingUPI',
        condition: (formValue) => formValue.status === 'PAID' && formValue.paymentMethod === 'UPI'
    },
    // Status-specific reason fields
    {
        fieldName: 'cancellationReason',
        condition: (formValue) => formValue.status === 'CANCELLED'
    },
    {
        fieldName: 'laterPaymentReason',
        condition: (formValue) => formValue.status === 'PAY_LATER'
    },
    {
        fieldName: 'paymentFailureDetail',
        condition: (formValue) => formValue.status === 'PAYMENT_FAILED'
    },
    // Type-dependent fields
    {
        fieldName: 'startDate',
        condition: (formValue) => formValue.type === 'REGULAR'
    },
    {
        fieldName: 'endDate',
        condition: (formValue) => formValue.type === 'REGULAR'
    },
    {
        fieldName: 'donationFor',
        condition: (formValue) => formValue.type == 'ONETIME'
    }
]

