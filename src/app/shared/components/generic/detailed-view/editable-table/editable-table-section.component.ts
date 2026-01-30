import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { buildRowValidator } from 'src/app/shared/utils/row-validator.factory';

@Component({
    selector: 'app-editable-table-section',
    templateUrl: './editable-table-section.component.html',
    styleUrls: ['./editable-table-section.component.scss']
})
export class EditableTableSectionComponent implements OnInit {

    @Input() view!: DetailedView;
    @Input() refData!: { [name: string]: KeyValue[]; };

    hiddenColumns = new Set<string>();

    ngOnInit(): void {
        this.view.editableTable?.columns.forEach(col => {
            if (col.hideField) {
                this.hiddenColumns.add(col.columnDef);
            }
        });
    }

    get visibleColumns() {
        return this.view.editableTable?.columns.filter(c => {
            // Manually hidden by user
            if (this.hiddenColumns.has(c.columnDef)) {
                return false;
            }
            // Configuration: hidden in edit mode
            if (this.view.show_form && c.hideInEditMode) {
                return false;
            }
            return true;
        }) ?? [];
    }

    get gridStyle(): string {
        const count = this.visibleColumns.length;
        const actionCol = this.view.show_form ? '60px' : '';
        return `repeat(${count}, 1fr) ${actionCol}`;
    }

    toggleColumn(colDef: string): void {
        if (this.hiddenColumns.has(colDef)) {
            this.hiddenColumns.delete(colDef);
        } else {
            this.hiddenColumns.add(colDef);
        }
    }


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

    deleteAll(): void {
        while (this.tableArray.length !== 0) {
            this.tableArray.removeAt(0);
        }
    }

    markAllTouched(): void {
        this.tableArray.markAllAsTouched();
    }

    displayValue = (section: string | undefined, code: string | undefined) => {
        if (this.refData && section && code) {
            return this.refData[section]?.find(f => f.key == code)?.displayValue;
        }
        return code;
    }
}
