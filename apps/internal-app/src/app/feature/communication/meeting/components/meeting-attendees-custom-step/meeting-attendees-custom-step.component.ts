import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { ListFormCustomStepComponent } from '@nabarun-ngo/list-dashboard-angular';
import { MeetingDataSource } from '../../data/meeting-data.source';
import type { MeetingAttendeeOption } from '../../domain';

@Component({
  selector: 'app-meeting-attendees-custom-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attendee-step">
      <p class="attendee-step__hint" *ngIf="!members.length">Loading members…</p>
      <label
        class="attendee-step__item"
        *ngFor="let member of members; trackBy: trackByMemberId">
        <input
          type="checkbox"
          [checked]="selected.has(member.id)"
          (change)="toggle(member.id, $event)" />
        <span>
          <strong>{{ member.fullName }}</strong>
          <small>{{ member.email }}</small>
        </span>
      </label>
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .attendee-step { display: grid; gap: 8px; }
    .attendee-step__hint { margin: 0; color: #6b7280; font-size: 0.8rem; }
    .attendee-step__item {
      display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start;
      border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; cursor: pointer;
    }
    .attendee-step__item strong { display: block; font-size: 0.85rem; }
    .attendee-step__item small { color: #6b7280; font-size: 0.72rem; }
  `],
})
export class MeetingAttendeesCustomStepComponent
  implements ListFormCustomStepComponent<string[]> {
  private readonly meetingData = inject(MeetingDataSource);

  @Input() set data(value: string[] | undefined) {
    if (value === this.lastEmitted) return;
    this.selected = new Set(Array.isArray(value) ? value : []);
  }

  @Output() dataChange = new EventEmitter<string[]>();

  protected members: MeetingAttendeeOption[] = [];
  protected selected = new Set<string>();
  protected readonly trackByMemberId = (_index: number, member: MeetingAttendeeOption): string =>
    member.id;

  private lastEmitted?: readonly string[];
  private loaded = false;

  constructor() {
    if (!this.loaded) {
      this.loaded = true;
      this.meetingData.fetchActiveMembers().subscribe(members => {
        this.members = members;
      });
    }
  }

  validate(): boolean {
    return this.selected.size >= 1;
  }

  protected toggle(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) this.selected.add(id);
    else this.selected.delete(id);
    const next = [...this.selected];
    this.lastEmitted = next;
    this.dataChange.emit(next);
  }
}
