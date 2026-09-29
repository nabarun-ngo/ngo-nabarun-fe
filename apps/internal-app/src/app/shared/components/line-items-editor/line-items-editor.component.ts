import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface LineItemRow {
  itemName: string;
  amount: number;
}

@Component({
  selector: 'app-line-items-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-items-editor.component.html',
  styleUrls: ['./line-items-editor.component.scss'],
})
export class LineItemsEditorComponent {
  @Input() rows: LineItemRow[] = [];
  @Input() minRows = 1;
  @Output() rowsChange = new EventEmitter<LineItemRow[]>();

  validate(): boolean {
    return this.rows.length >= this.minRows
      && this.rows.every(row => row.itemName.trim().length > 0 && row.amount > 0);
  }

  addRow(): void {
    this.rows = [...this.rows, { itemName: '', amount: 0 }];
    this.rowsChange.emit(this.rows);
  }

  removeRow(index: number): void {
    if (this.rows.length <= this.minRows) {
      return;
    }
    this.rows = this.rows.filter((_, i) => i !== index);
    this.rowsChange.emit(this.rows);
  }

  onItemChange(index: number, field: keyof LineItemRow, value: string): void {
    const next = [...this.rows];
    if (field === 'amount') {
      next[index] = { ...next[index], amount: Number(value) || 0 };
    } else {
      next[index] = { ...next[index], itemName: value };
    }
    this.rows = next;
    this.rowsChange.emit(this.rows);
  }

  trackRow(index: number): number {
    return index;
  }
}
