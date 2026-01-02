import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { buildRowValidator } from 'src/app/shared/utils/row-validator.factory';

@Component({
    selector: 'app-editable-table-section',
    templateUrl: './editable-table-section.component.html',
    styleUrls: ['./editable-table-section.component.scss']
})
export class EditableTableSectionComponent {

    @Input() view!: DetailedView;

    get tableArray(): FormArray {
        return this.view.section_form.get(
            this.view.editableTable!.formArrayName
        ) as FormArray;
    }

    get displayedColumns(): string[] {
        const cols = this.view.editableTable!.columns.map(c => c.columnDef);
        return this.view.show_form ? [...cols, 'actions'] : cols;
    }

    addRow(): void {
        const rules = this.view.editableTable?.rowValidationRules ?? [];

        const row = new FormGroup(
            {},
            { validators: buildRowValidator(rules) }
        );

        this.view.editableTable!.columns.forEach(col => {
            row.addControl(
                col.columnDef,
                new FormControl(
                    null,
                    col.validators ?? [],
                    col.asyncValidators ?? []
                )
            );
        });

        this.tableArray.push(row);
    }

    removeRow(index: number): void {
        this.tableArray.removeAt(index);
    }

    markAllTouched(): void {
        this.tableArray.markAllAsTouched();
    }
}
