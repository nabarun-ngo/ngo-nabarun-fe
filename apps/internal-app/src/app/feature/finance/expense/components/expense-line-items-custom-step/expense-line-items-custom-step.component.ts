import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ListFormCustomStepComponent } from '@nabarun-ngo/list-dashboard-angular';
import {
  LineItemRow,
  LineItemsEditorComponent,
} from 'src/app/shared/components/line-items-editor/line-items-editor.component';

/**
 * Adapts {@link LineItemsEditorComponent} to the list-dashboard custom-step contract.
 */
@Component({
  selector: 'app-expense-line-items-custom-step',
  standalone: true,
  imports: [CommonModule, LineItemsEditorComponent],
  template: `
    <app-line-items-editor
      [rows]="rows"
      (rowsChange)="onRowsChange($event)">
    </app-line-items-editor>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
    }
  `],
})
export class ExpenseLineItemsCustomStepComponent
  implements ListFormCustomStepComponent<LineItemRow[]> {
  @Input() set data(value: LineItemRow[] | undefined) {
    if (value === this.lastEmitted) return;
    this.rows = Array.isArray(value) && value.length
      ? value.map(row => ({ ...row }))
      : [{ itemName: '', amount: 0 }];
  }

  @Output() dataChange = new EventEmitter<LineItemRow[]>();

  protected rows: LineItemRow[] = [{ itemName: '', amount: 0 }];

  private lastEmitted?: readonly LineItemRow[];

  validate(): boolean {
    return this.rows.length >= 1
      && this.rows.every(row => row.itemName.trim().length > 0 && row.amount > 0);
  }

  protected onRowsChange(rows: LineItemRow[]): void {
    this.rows = rows;
    this.lastEmitted = rows;
    this.dataChange.emit(rows);
  }
}
