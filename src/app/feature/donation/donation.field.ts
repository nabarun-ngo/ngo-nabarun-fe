import { FormGroup } from "@angular/forms";
import { DocumentDto, DonationDto, KeyValue } from "src/app/core/api-client/models";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { DonationRefData, DonationStatus, DonationType, donationTab } from "./donation.const";
import { EventEmitter } from "stream";


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
    donation: DonationDto,
    options: {
        isCreate?: boolean,
        refData?: { [name: string]: KeyValue[] }
    }
): DetailedView => {
    const { isCreate, refData } = options;

    return {
        section_name: 'Donation Details',
        section_type: 'key_value',
        section_html_id: 'donation_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Donation number',
                field_value: donation?.id!,
                hide_field: isCreate
            },
            {
                field_name: 'Donation type',
                field_value: donation?.type!,
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.type,
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
                field_value: (donation.currency || '₹') + ' ' + (donation.amount || ''),
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
                field_value: donation?.status!,
                show_display_value: true,
                ref_data_section: DonationRefData.refDataKey.status,
                hide_field: isCreate,
                form_control_name: 'status',
                form_input: {
                    html_id: 'status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. Paid',
                    selectList: refData?.[DonationRefData.refDataKey.nextStatus] || []
                }
            },
            {
                field_name: 'Donation start date',
                field_value: date(donation?.startDate!),
                hide_field: !(donation?.type === DonationType.Regular || (isCreate)),
                editable: (isCreate) && (donation?.type === DonationType.Regular || isCreate),
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
                field_value: date(donation?.endDate!),
                hide_field: !(donation?.type === DonationType.Regular || (isCreate)),
                editable: (isCreate) && (donation?.type === DonationType.Regular || isCreate),
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
                field_value: date(donation?.raisedOn!),
                hide_field: isCreate
            },
            {
                field_name: 'Donation paid on',
                field_value: date(donation.paidOn!),
                hide_field: !(donation.status === DonationStatus.Paid),
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
                field_value: donation.paidToAccount?.accountHolderName + (donation.paidToAccount?.id ? ` (${donation.paidToAccount?.id})` : ''),
                hide_field: !(donation.status === DonationStatus.Paid),
                form_control_name: 'paidToAccount',
                form_input: {
                    html_id: 'paidToAccount',
                    tagName: 'select',
                    inputType: '',
                    selectList: []
                }
            },
            {
                field_name: 'Payment method',
                field_value: donation.paymentMethod!,
                hide_field: !(donation.status === DonationStatus.Paid),
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
                field_value: donation.paidUsingUPI!,
                hide_field: !(donation.paidUsingUPI),
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
                field_value: donation.confirmedBy?.fullName!,
                hide_field: !(donation.status === DonationStatus.Paid)
            },
            {
                field_name: 'Donation confirmed on',
                field_value: date(donation.confirmedOn!),
                hide_field: !(donation.status === DonationStatus.Paid)
            },
            {
                field_name: 'Remarks',
                field_value: donation.remarks!,
                hide_field: !(donation.status === DonationStatus.Paid),
                form_control_name: 'remarks',
                form_input: {
                    html_id: 'remarks',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Remarks',
                }
            },
            {
                field_name: 'Reason for cancel',
                field_value: donation.cancelletionReason!,
                hide_field: !(donation.status === DonationStatus.Cancelled),
                form_control_name: 'cancelletionReason',
                form_input: {
                    html_id: 'cancelletionReason',
                    tagName: 'textarea',
                    inputType: '',
                    placeholder: 'Ex. Cancelletion reason'
                }
            },
            {
                field_name: 'Reason for paying later',
                field_value: donation.laterPaymentReason!,
                hide_field: !(donation.status === DonationStatus.PayLater),
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
                field_value: donation.paymentFailureDetail!,
                hide_field: !(donation.status === DonationStatus.PaymentFailed),
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
                field_value: donation.forEvent ? 'Yes' : 'No',
                hide_field: !(isCreate || donation.type === DonationType.Onetime),
                editable: isCreate,
                form_control_name: 'isForEvent',
                form_input: {
                    html_id: 'isForEvent',
                    tagName: 'input',
                    inputType: 'radio',
                    selectList: [{ key: 'true', displayValue: 'Yes' }, { key: 'false', displayValue: 'No' }]
                }
            },
            {
                field_name: 'Select event',
                field_value: donation.forEvent!,
                hide_field: !donation.forEvent && !isCreate,
                editable: isCreate,
                form_control_name: 'eventId',
                form_input: {
                    html_id: 'eventId',
                    tagName: 'select',
                    inputType: '',
                    selectList: []
                }
            }
        ]
    };
};

export const donationDocumentSection = (
    docs: DocumentDto[]
) => {
    return {
        section_name: 'Documents',
        section_type: 'doc_list',
        section_html_id: 'document_list',
        section_form: new FormGroup({}),
        documents: docs,
        doc: {
            // docChange: new EventEmitter(),
        },
    } as DetailedView;
};
