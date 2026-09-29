import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpiDetail } from 'src/app/feature/finance/accounts/domain';

@Component({
  selector: 'app-upi-rows-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upi-rows-editor.component.html',
  styleUrls: ['./upi-rows-editor.component.scss'],
})
export class UpiRowsEditorComponent {
  @Input() rows: UpiDetail[] = [];
  @Output() rowsChange = new EventEmitter<UpiDetail[]>();

  validate(): boolean {
    return this.rows.some(row => !!row.upiId?.trim());
  }

  addRow(): void {
    this.rows = [...this.rows, { isPrimary: this.rows.length === 0 }];
    this.rowsChange.emit(this.rows);
  }

  removeRow(index: number): void {
    if (this.rows.length <= 1) {
      return;
    }
    const next = this.rows.filter((_, i) => i !== index);
    if (!next.some(row => row.isPrimary) && next.length) {
      next[0] = { ...next[0], isPrimary: true };
    }
    this.rows = next;
    this.rowsChange.emit(this.rows);
  }

  setPrimary(index: number): void {
    this.rows = this.rows.map((row, i) => ({ ...row, isPrimary: i === index }));
    this.rowsChange.emit(this.rows);
  }

  onRowChange(): void {
    this.rowsChange.emit(this.rows);
  }

  trackRow(index: number): number {
    return index;
  }
}
