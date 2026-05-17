
import { ReportDetailDto } from "src/app/core/api-client/models/report-detail-dto";
import { DetailedView, DetailedViewField } from "src/app/shared/model/detailed-view.model";
import { FormGroup, Validators } from "@angular/forms";
import { FieldAttributeDto } from "src/app/core/api-client/models";

export const getReportInputDetailSection = (m: ReportDetailDto | undefined, fields: FieldAttributeDto[], isCreate: boolean = false): DetailedView => {
    return {
        section_name: `Report Data`,
        section_type: `key_value`,
        section_html_id: `report_data`,
        hide_section: !isCreate && (!m?.parameters || Object.keys(m?.parameters || {}).length == 0),
        section_form: new FormGroup({}),
        show_form: isCreate,
        autoSaveId: isCreate ? `report-data-create` : `report-data-edit-${m?.id}`,
        form_alerts: [
            {
                hide_alert: !isCreate,
                data: {
                    alertType: 'warning',
                    message: `Report generation might take a few minutes depending on the size of the data.`
                }
            }
        ],
        content: fields.map(field => ({
            editable: true,
            field_name: field.value,
            field_html_id: field.key,
            field_value: m?.parameters ? (m?.parameters as any)[field.key] : undefined,
            form_control_name: field.key,
            form_input: {
                html_id: field.key + `_field`,
                tagName: field.fieldType,
                inputType: field.type,
                placeholder: `Enter ${field.value}`,
                selectList: field.fieldOptions.map(option => ({
                    key: option,
                    displayValue: option
                })),
            },
            form_input_validation: field.isMandatory ? [Validators.required] : [],
        }) as DetailedViewField)
    };
}
