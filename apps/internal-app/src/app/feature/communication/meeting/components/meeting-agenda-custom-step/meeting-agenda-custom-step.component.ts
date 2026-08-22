import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trackByIndex } from '@nabarun-ngo/list-dashboard-angular';
import type { ListFormCustomStepComponent } from '@nabarun-ngo/list-dashboard-angular';
import type { MeetingAgendaRow } from '../../config/meeting.forms';

@Component({
  selector: 'app-meeting-agenda-custom-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agenda-step">
      <div
        class="agenda-step__row"
        *ngFor="let row of rows; let i = index; trackBy: trackByIndex">
        <label class="agenda-step__label">Agenda item {{ i + 1 }}</label>
        <input
          class="agenda-step__input"
          type="text"
          [value]="row.agenda"
          placeholder="Agenda topic"
          (input)="onAgendaChange(i, $event)" />
        <textarea
          class="agenda-step__input agenda-step__input--area"
          rows="2"
          [value]="row.outcomes || ''"
          placeholder="Outcomes (optional)"
          (input)="onOutcomesChange(i, $event)"></textarea>
        <button
          type="button"
          class="agenda-step__remove"
          *ngIf="rows.length > 1"
          (click)="removeRow(i)">
          Remove
        </button>
      </div>
      <button type="button" class="agenda-step__add" (click)="addRow()">
        + Add agenda item
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .agenda-step { display: grid; gap: 12px; }
    .agenda-step__row {
      display: grid; gap: 6px;
      border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px;
    }
    .agenda-step__label { font-size: 0.75rem; font-weight: 600; color: #4b5563; }
    .agenda-step__input {
      width: 100%; border: 1px solid #9ca3af; border-radius: 8px;
      padding: 8px 10px; font: inherit;
    }
    .agenda-step__input--area { resize: vertical; }
    .agenda-step__add, .agenda-step__remove {
      border: 1px dashed #6b7280; background: #fff; border-radius: 999px;
      padding: 8px 12px; font: inherit; font-weight: 600; cursor: pointer;
    }
    .agenda-step__remove { border-style: solid; justify-self: start; }
  `],
})
export class MeetingAgendaCustomStepComponent
  implements ListFormCustomStepComponent<MeetingAgendaRow[]> {
  @Input() set data(value: MeetingAgendaRow[] | undefined) {
    if (value === this.lastEmitted) return;
    this.rows = Array.isArray(value) && value.length
      ? value.map(row => ({ ...row }))
      : [{ agenda: '', outcomes: '' }];
  }

  @Output() dataChange = new EventEmitter<MeetingAgendaRow[]>();

  protected rows: MeetingAgendaRow[] = [{ agenda: '', outcomes: '' }];
  protected readonly trackByIndex = trackByIndex;
  private lastEmitted?: readonly MeetingAgendaRow[];

  validate(): boolean {
    return this.rows.some(row => row.agenda.trim().length > 0);
  }

  protected addRow(): void {
    this.rows = [...this.rows, { agenda: '', outcomes: '' }];
    this.emit();
  }

  protected removeRow(index: number): void {
    this.rows = this.rows.filter((_, i) => i !== index);
    this.emit();
  }

  protected onAgendaChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.rows = this.rows.map((row, i) =>
      i === index ? { ...row, agenda: value } : row);
    this.emit();
  }

  protected onOutcomesChange(index: number, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.rows = this.rows.map((row, i) =>
      i === index ? { ...row, outcomes: value } : row);
    this.emit();
  }

  private emit(): void {
    this.lastEmitted = this.rows;
    this.dataChange.emit(this.rows);
  }
}
