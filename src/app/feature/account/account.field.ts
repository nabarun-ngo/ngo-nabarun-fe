import { KeyValue } from "src/app/core/api/models/key-value";
import { AccountConstant, accountTab } from "./account.const";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { AccordionCell } from "src/app/shared/model/accordion-list.model";
import { AccountDetail } from "src/app/core/api/models/account-detail";
import { ExpenseDetail } from "src/app/core/api/models";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { FormGroup, Validators } from "@angular/forms";
import { constant } from "tests/data/constant";
import { date } from "src/app/core/service/utilities.service";

export const accountTabHeader = (tab: accountTab) => {
    return [
        {
            value: 'Account Id',
            rounded: true
        },
        {
            value: 'Account Type',
            rounded: true
        },
        {
            value: 'Account Type',
            rounded: true
        },
        tab == 'my_accounts' ?
            {
                value: 'Account Balance',
                rounded: true
            }
            :
            {
                value: 'Account Holder Name',
                rounded: true
            }
    ]
}


export const accountSearchInput = (refData: { [name: string]: KeyValue[]; }): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search Account Number',
        advancedSearch: {
            searchFormFields: [
                {
                    formControlName: 'accountNo',
                    inputModel: {
                        tagName: 'input',
                        inputType: 'text',
                        html_id: 'accountNo',
                        labelName: 'Account Number',
                        placeholder: 'Enter Account Number',
                    },
                },
                {
                    formControlName: 'type',
                    inputModel: {
                        tagName: 'select',
                        inputType: 'multiselect',
                        html_id: 'type',
                        labelName: 'Account Type',
                        placeholder: 'Select Account Type',
                        selectList: refData['accountTypes']
                    },
                },
                {
                    formControlName: 'status',
                    inputModel: {
                        tagName: 'select',
                        inputType: 'multiselect',
                        html_id: 'status',
                        labelName: 'Account Status',
                        placeholder: 'Select Account Status',
                        selectList: refData['accountStatuses']
                    },
                }
            ]
        }
    };
}


export const accountHighLevelView = (item: AccountDetail, tab: accountTab, refData: { [name: string]: KeyValue[]; }): AccordionCell[] => {
    return [
        {
            type: 'text',
            value: item?.id!,
            bgColor: 'bg-purple-200'
        },
        {
            type: 'text',
            value: item?.accountType!,
            showDisplayValue: true,
            refDataSection: AccountConstant.refDataKey.accountType
        },
        {
            type: 'text',
            value: item?.accountStatus!,
            showDisplayValue: true,
            refDataSection: AccountConstant.refDataKey.accountStatus
        },
        tab == 'my_accounts' ?
            {
                type: 'text',
                value: '₹ ' + item?.currentBalance
            }
            :
            {
                type: 'text',
                value: item?.accountHolderName!
            }
    ];
}

export const accountDetailSection = (m: AccountDetail, refData: { [name: string]: KeyValue[]; }, isCreate: boolean = false): DetailedView => {
    // if(isCreate){
    //     return {
    //         section_name: 'Account Detail',
    //         section_type: 'key_value',
    //         section_html_id: 'account_detail',
    //         section_form: new FormGroup({}),
    //         show_form: true,
    //         content: [
    //             {
    //                 field_name: 'Account Type',
    //                 field_html_id: 'account_type',
    //                 field_value: '',
    //                 show_display_value: true,
    //                 ref_data_section: AccountConstant.refDataKey.accountType,
    //                 editable: true,
    //                 form_control_name: 'accountType',
    //                 form_input: {
    //                     tagName: 'select',
    //                     selectList: refData![AccountConstant.refDataKey.accountType],
    //                     placeholder: 'Ex. '
    //                 },
    //                 form_input_validation: [Validators.required]
    //             },
    //             {
    //                 field_name: 'Account Holder',
    //                 field_html_id: 'account_holder',
    //                 field_value: m?.accountHolderName!,
    //                 editable: true,
    //                 form_control_name: 'accountHolder',
    //                 form_input: {
    //                     tagName: 'select',
    //                     selectList: [],
    //                     placeholder: 'Ex. '
    //                 },
    //                 form_input_validation: [Validators.required]
    //             },
    //             {
    //                 field_name: 'Opening Balance',
    //                 field_html_id: 'opening_bal',
    //                 field_value: '',
    //                 editable: true,
    //                 form_control_name: 'openingBalance',
    //                 form_input: {
    //                     tagName: 'input',
    //                     placeholder: 'Ex. 20'
    //                 },
    //                 form_input_validation: []
    //             },
    //         ]
    //     } as DetailedView;
    // }
    return {
        section_name: 'Account Detail',
        section_type: 'key_value',
        section_html_id: 'account_detail',
        section_form: new FormGroup({}),
        show_form: false,
        content: [
            {
                field_name: 'Account Id',
                field_html_id: 'account_id',
                hide_field: isCreate,
                field_value: m?.id!,
            },
            {
                field_name: 'Account Type',
                field_html_id: 'account_type',
                field_value: m?.accountType!,
                show_display_value: true,
                ref_data_section: AccountConstant.refDataKey.accountType,
                editable: isCreate,
                form_control_name: 'accountType',
                form_input: {
                    tagName: 'select',
                    selectList: refData![AccountConstant.refDataKey.accountType],
                    placeholder: 'Ex. '
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Account Status',
                field_html_id: 'account_status',
                field_value: m?.accountStatus!,
                hide_field: isCreate,
                showDisplayValue: true,
                refDataSection: AccountConstant.refDataKey.accountStatus,
                form_control_name: 'status',
                editable: !isCreate,
                form_input: {
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Ex. Active',
                    selectList: refData![AccountConstant.refDataKey.accountStatus]
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Activated On',
                field_html_id: 'creation_date',
                hide_field: isCreate,
                field_value: date(m?.activatedOn!)
            },
            {
                field_name: 'Current Balance',
                field_html_id: 'balance',
                hide_field: isCreate,
                field_value: '₹ ' + m?.currentBalance
            },

            {
                field_name: 'Account Holder',
                field_html_id: 'account_holder',
                field_value: m?.accountHolderName!,
                editable: isCreate,
                form_control_name: 'accountHolder',
                form_input: {
                    tagName: 'input',
                    inputType:'text',
                    autocomplete:true,
                    selectList: [],
                    placeholder: 'Ex. '
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Opening Balance',
                field_html_id: 'opening_bal',
                hide_field: !isCreate,
                field_value: '',
                editable: true,
                form_control_name: 'openingBalance',
                form_input: {
                    tagName: 'input',
                    placeholder: 'Ex. 20'
                },
                form_input_validation: []
            },

        ]
    } as DetailedView;
}

export const bankDetailSection = (m: AccountDetail) => {
    return {
        section_name: 'Bank Detail',
        section_type: 'key_value',
        section_html_id: 'bank_detail',
        section_form: new FormGroup({}),
        hide_section: !m?.bankDetail,
        content: [
            {
                field_name: 'Bank Account Number',
                field_html_id: 'bank_acc_num',
                field_value: m?.bankDetail?.bankAccountNumber!,
                editable: true,
                form_control_name: 'bankAccountNumber',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. A123456789'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Bank Account Holder Name',
                field_html_id: 'account_type',
                field_value: m?.bankDetail ? m?.bankDetail?.bankAccountHolderName! : m?.accountHolderName!,
                editable: true,
                form_control_name: 'bankAccountHolderName',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. Jone Doe'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Bank Name',
                field_html_id: 'bank_name',
                field_value: m?.bankDetail?.bankName!,
                editable: true,
                form_control_name: 'bankName',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. Indian Bank'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Bank Account Type',
                field_html_id: 'bank_type',
                field_value: m?.bankDetail?.bankAccountType!,
                editable: true,
                form_control_name: 'bankAccountType',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. Savings'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Bank Branch Name',
                field_html_id: 'bank_branch',
                field_value: m?.bankDetail?.bankBranch!,
                editable: true,
                form_control_name: 'bankBranch',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. Kolkata'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Bank IFSC Number',
                field_html_id: 'bank_IFSC',
                field_value: m?.bankDetail?.IFSCNumber!,
                editable: true,
                form_control_name: 'IFSCNumber',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. IBN0000A'
                },
                form_input_validation: [Validators.required]
            },
        ]
    } as DetailedView;
}

export const upiDetailSection = (m: AccountDetail,) => {
    return {
        section_name: 'UPI Detail',
        section_type: 'key_value',
        section_html_id: 'upi_detail',
        section_form: new FormGroup({}),
        hide_section: !m?.upiDetail,
        content: [
            {
                field_name: 'UPI Id',
                field_html_id: 'upi_id',
                field_value: m?.upiDetail?.upiId!,
                editable: true,
                form_control_name: 'upiId',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. abcd@okhdfc'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'UPI Owner Name',
                field_html_id: 'upi_owner_name',
                field_value: m?.upiDetail ? m?.upiDetail.payeeName! : m?.accountHolderName!,
                editable: true,
                form_control_name: 'payeeName',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. John Doe'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'UPI Mobile Number',
                field_html_id: 'upi_mob_Num',
                field_value: m?.upiDetail?.mobileNumber!,
                editable: true,
                form_control_name: 'mobileNumber',
                form_input: {
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. +91 1000000001'
                },
                form_input_validation: [Validators.required]
            },
        ]
    } as DetailedView;
}

export const transferAmountSection = () => {
    return {
        section_form: new FormGroup({}),
        section_name: 'Transfer Amount',
        section_type: 'key_value',
        section_html_id: 'transfer_amt',
        hide_section: true,
        content: [
            {
                field_name: 'Select Transfer To Account',
                field_value: '',
                form_control_name: 'transferTo',
                editable: true,
                field_html_id: 'transferTo',
                form_input: {
                    html_id: 'transferTo_inp',
                    inputType: '',
                    tagName: 'select',
                    selectList: []
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Transfer Amount',
                field_value: '',
                form_control_name: 'amount',
                editable: true,
                field_html_id: 'amount',
                form_input: {
                    html_id: 'amount_i',
                    inputType: 'number',
                    tagName: 'input',
                    placeholder: 'Ex. 500'
                },
                form_input_validation: [Validators.required, Validators.min(1)]
            },
            {
                field_name: 'Transfer Description',
                field_value: '',
                form_control_name: 'description',
                editable: true,
                field_html_id: 'description',
                form_input: {
                    html_id: 'description_i',
                    inputType: 'text',
                    tagName: 'input',
                    placeholder: 'Ex. Monthly donation'
                },
                form_input_validation: [Validators.required]
            }
        ]

    } as DetailedView;
}

