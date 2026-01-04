import { Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { buildRowValidator } from 'src/app/shared/utils/row-validator.factory';

@Component({
    selector: 'app-editable-list-section',
    templateUrl: './editable-list-section.component.html',
    styleUrls: ['./editable-list-section.component.scss']
})
export class EditableListSectionComponent {

    @Input() view!: DetailedView;
    @Input() refData!: { [name: string]: KeyValue[]; };

    get listArray(): FormArray {
        return this.view.section_form.get(
            this.view.editableList!.formArrayName
        ) as FormArray;
    }

    asFormGroup(control: AbstractControl): FormGroup {
        return control as FormGroup;
    }

    getControl(item: AbstractControl, controlName: string): AbstractControl | null {
        return item.get(controlName);
    }

    addItem(): void {
        const rules = this.view.editableList?.rowValidationRules ?? [];

        const item = new FormGroup(
            {},
            { validators: buildRowValidator(rules) }
        );

        this.view.editableList!.itemFields.forEach(field => {
            item.addControl(
                field.form_control_name!,
                new FormControl(
                    field.field_value ?? null,
                    field.form_input_validation ?? []
                )
            );
        });

        this.listArray.push(item);
    }

    removeItem(index: number): void {
        this.listArray.removeAt(index);
    }

    displayValue = (section: string | undefined, code: string | undefined) => {
        if (this.refData && section && code) {
            return this.refData[section]?.find(f => f.key == code)?.displayValue;
        }
        return code;
    }
}
