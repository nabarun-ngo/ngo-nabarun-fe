import { FormGroup, Validators } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { ProjectConstant } from "../project.const";
import { KeyValue } from "src/app/shared/model/key-value.model";
import { Project } from "../model/project.model";
import { User } from "../../member/models/member.model";

/**
 * Project fields configuration
 */

export const projectSearchInput = (
    refData: {
        [name: string]: any[];
    },
): SearchAndAdvancedSearchModel => {
    return {
        normalSearchPlaceHolder: 'Search projects by name or code...',
        disableAdvancedSearchBtn: false,
        advancedSearch: {
            title: 'Advanced Project Search',
            buttonText: {
                search: 'Search',
                close: 'Close'
            },
            searchFormFields: [
                {
                    formControlName: 'category',
                    inputModel: {
                        tagName: 'select',
                        inputType: '',
                        html_id: 'category',
                        labelName: 'Category',
                        placeholder: 'Select Category',
                        selectList: refData[ProjectConstant.refDataKey.categories],
                        cssInputClass: 'bg-white'
                    }
                },
                {
                    formControlName: 'status',
                    inputModel: {
                        tagName: 'select',
                        inputType: '',
                        html_id: 'status',
                        labelName: 'Status',
                        placeholder: 'Select Status',
                        selectList: refData[ProjectConstant.refDataKey.statuses],
                        cssInputClass: 'bg-white'
                    }
                },
                {
                    formControlName: 'phase',
                    inputModel: {
                        tagName: 'select',
                        inputType: '',
                        html_id: 'phase',
                        labelName: 'Phase',
                        placeholder: 'Select Phase',
                        selectList: refData[ProjectConstant.refDataKey.phases],
                        cssInputClass: 'bg-white'
                    }
                },
            ]
        }
    };
};

/**
 * Get project detail section for detailed view
 */
export const getProjectSection = (
    project: Project,
    refData: { [name: string]: KeyValue[] },
    managers: User[],
    isCreate: boolean = false,
): DetailedView => {
    const managersKV = managers.map(m => {
        return {
            key: m?.id,
            displayValue: m?.fullName
        } as KeyValue;
    })
    return {
        section_name: 'Project Details',
        section_type: 'key_value',
        section_html_id: 'project_detail',
        section_form: new FormGroup({}),
        content: [
            {
                field_name: 'Project Code',
                field_value: project?.code || '',
                editable: isCreate,
                form_control_name: 'code',
                field_html_id: 'project_code',
                form_input: {
                    html_id: 'project_code',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter project code'
                },
                form_input_validation: [Validators.required, Validators.maxLength(3), Validators.minLength(3)]
            },
            {
                field_name: 'Project Name',
                field_value: project?.name,
                editable: true,
                form_control_name: 'name',
                field_html_id: 'project_name',
                form_input: {
                    html_id: 'project_name',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter project name'
                },
                form_input_validation: isCreate ? [Validators.required, Validators.maxLength(50), Validators.minLength(2)] : []
            },
            {
                field_name: 'Project Goal(s)',
                field_value: project?.description,
                editable: true,
                form_control_name: 'description',
                field_html_id: 'project_description',
                form_input: {
                    html_id: 'project_description',
                    tagName: 'textarea',
                    inputType: 'text',
                    placeholder: 'Enter project description'
                },
                form_input_validation: isCreate ? [Validators.required, Validators.maxLength(500), Validators.minLength(2)] : []
            },
            {
                field_name: 'Project Category',
                field_value: project?.category,
                show_display_value: true,
                ref_data_section: ProjectConstant.refDataKey.categories,
                editable: true,
                form_control_name: 'category',
                field_html_id: 'project_category',
                form_input: {
                    html_id: 'project_category',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select category',
                    selectList: refData?.[ProjectConstant.refDataKey.categories] || []
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Project Status',
                field_value: project?.status,
                show_display_value: true,
                ref_data_section: ProjectConstant.refDataKey.statuses,
                editable: true,
                form_control_name: 'status',
                field_html_id: 'project_status',
                form_input: {
                    html_id: 'project_status',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select status',
                    selectList: refData?.[ProjectConstant.refDataKey.statuses] || []
                },
                form_input_validation: []
            },
            {
                field_name: 'Project Phase',
                field_value: project?.phase,
                show_display_value: true,
                ref_data_section: ProjectConstant.refDataKey.phases,
                editable: project?.status === 'ACTIVE',
                form_control_name: 'phase',
                field_html_id: 'project_phase',
                form_input: {
                    html_id: 'project_phase',
                    tagName: 'select',
                    inputType: '',
                    placeholder: 'Select phase',
                    selectList: refData?.[ProjectConstant.refDataKey.phases] || []
                },
                form_input_validation: []
            },
            {
                field_name: 'Budget',
                field_value: project?.budget ? `${project.budget}` : undefined,
                field_display_value: project?.budget ? `${project.currency} ${project.budget.toLocaleString('en-IN')}` : undefined,
                editable: true,
                form_control_name: 'budget',
                field_html_id: 'project_budget',
                form_input: {
                    html_id: 'project_budget',
                    tagName: 'input',
                    inputType: 'number',
                    placeholder: 'Enter budget'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Currency',
                field_value: project?.currency || 'INR',
                editable: isCreate,
                form_control_name: 'currency',
                field_html_id: 'project_currency',
                form_input: {
                    html_id: 'project_currency',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter currency (e.g., INR)'
                },
                form_input_validation: [Validators.required]
            },
            {
                field_name: 'Spent Amount',
                field_value: project?.spentAmount ? `${project.spentAmount}` : undefined,
                field_display_value: project?.spentAmount ? `${project.currency} ${project.spentAmount.toLocaleString('en-IN')}` : undefined,
                hide_field: isCreate
            },
            {
                field_name: 'Start Date',
                field_value: project?.startDate || '',
                field_display_value: date(project?.startDate),
                editable: isCreate,
                form_control_name: 'startDate',
                field_html_id: 'project_start_date',
                form_input: {
                    html_id: 'project_start_date',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Select start date'
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'End Date',
                field_value: project?.endDate || '',
                field_display_value: date(project?.endDate),
                editable: true,
                form_control_name: 'endDate',
                field_html_id: 'project_end_date',
                form_input: {
                    html_id: 'project_end_date',
                    tagName: 'input',
                    inputType: 'date',
                    placeholder: 'Select end date'
                },
                form_input_validation: []
            },
            {
                field_name: 'Actual End Date',
                field_value: project?.actualEndDate || '',
                field_display_value: date(project?.actualEndDate),
                hide_field: !project?.actualEndDate || isCreate
            },
            {
                field_name: 'Location',
                field_value: project?.location || '',
                editable: true,
                form_control_name: 'location',
                field_html_id: 'project_location',
                form_input: {
                    html_id: 'project_location',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter location'
                },
                form_input_validation: []
            },
            {
                field_name: 'Manager',
                field_value: project?.managerId,
                field_display_value: managers.find(m => m.id === project?.managerId)?.fullName,
                editable: isCreate,
                form_control_name: 'managerId',
                field_html_id: 'project_manager_id',
                form_input: {
                    html_id: 'project_manager_id',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Select manager',
                    autocomplete: true,
                    selectList: managersKV
                },
                form_input_validation: isCreate ? [Validators.required] : []
            },
            {
                field_name: 'Sponsor ID',
                field_value: project?.sponsorId,
                editable: true,
                form_control_name: 'sponsorId',
                field_html_id: 'project_sponsor_id',
                form_input: {
                    html_id: 'project_sponsor_id',
                    tagName: 'input',
                    inputType: 'text',
                    placeholder: 'Enter sponsor ID (optional)'
                },
                form_input_validation: []
            },
            {
                field_name: 'Target Beneficiaries',
                field_value: project?.targetBeneficiaryCount ? `${project.targetBeneficiaryCount}` : undefined,
                editable: true,
                form_control_name: 'targetBeneficiaryCount',
                field_html_id: 'project_target_beneficiaries',
                form_input: {
                    html_id: 'project_target_beneficiaries',
                    tagName: 'input',
                    inputType: 'number',
                    placeholder: 'Enter target beneficiaries'
                },
                form_input_validation: []
            },
            {
                field_name: 'Actual Beneficiaries',
                field_value: project?.actualBeneficiaryCount ? `${project.actualBeneficiaryCount}` : undefined,
                hide_field: !project?.actualBeneficiaryCount || isCreate
            },
            {
                field_name: 'Created At',
                field_value: project?.createdAt || '',
                field_display_value: date(project?.createdAt),
                hide_field: isCreate
            }
        ]
    };
};
