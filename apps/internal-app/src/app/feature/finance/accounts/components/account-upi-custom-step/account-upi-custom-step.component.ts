import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ListFormCustomStepComponent } from '@nabarun-ngo/list-dashboard-angular';
import type { UpiDetail } from '../../domain';
import { UpiRowsEditorComponent } from 'src/app/shared/components/upi-rows-editor/upi-rows-editor.component';

/**
 * Adapts {@link UpiRowsEditorComponent} to the list-dashboard custom-step contract
 * (`data` / `dataChange` / `validate`).
 */
@Component({
  selector: 'app-account-upi-custom-step',
  standalone: true,
  imports: [CommonModule, UpiRowsEditorComponent],
  template: `
    <app-upi-rows-editor
      [rows]="rows"
      (rowsChange)="onRowsChange($event)">
    </app-upi-rows-editor>
  `,
})
export class AccountUpiCustomStepComponent
  implements ListFormCustomStepComponent<UpiDetail[]> {
  @Input() set data(value: UpiDetail[] | undefined) {
    // The host echoes our own emission back as a new `data` value. Re-cloning it would
    // hand the editor fresh row objects on every keystroke and drop input focus.
    if (value === this.lastEmitted) {
      return;
    }
    this.rows = Array.isArray(value) && value.length
      ? value.map(row => ({ ...row }))
      : [{ isPrimary: true }];
  }

  @Output() dataChange = new EventEmitter<UpiDetail[]>();

  protected rows: UpiDetail[] = [{ isPrimary: true }];

  private lastEmitted?: readonly UpiDetail[];

  validate(): boolean {
    const started = this.rows.filter(row =>
      !!row.upiId?.trim()
      || !!row.payeeName?.trim()
      || !!row.mobileNumber?.trim()
      || !!row.label?.trim(),
    );
    if (!started.length) {
      return true;
    }
    return started.every(row => !!row.upiId?.trim());
  }

  protected onRowsChange(rows: UpiDetail[]): void {
    this.rows = rows;
    this.lastEmitted = rows;
    this.dataChange.emit(rows);
  }
}
