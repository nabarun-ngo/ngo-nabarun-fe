import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MobileFormSheetComponent } from '@nabarun-ngo/list-dashboard-angular';
import type { Donor } from '../../domain';
import { sameDonorSelection } from '../../config/donor.rules';

export interface DonorMergeConfirmation {
  sourceDonorId: string;
  targetDonorId: string;
}

@Component({
  selector: 'app-donor-merge-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, MobileFormSheetComponent],
  templateUrl: './donor-merge-sheet.component.html',
  styleUrls: ['./donor-merge-sheet.component.scss'],
})
export class DonorMergeSheetComponent implements OnChanges {
  @Input() open = false;
  @Input() donors: Donor[] = [];
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<DonorMergeConfirmation>();

  protected targetDonorId = '';

  ngOnChanges(changes: SimpleChanges): void {
    if ('donors' in changes) {
      const previous = changes['donors'].previousValue as Donor[] | undefined;
      const current = changes['donors'].currentValue as Donor[] | undefined;
      if (!sameDonorSelection(previous, current)) {
        this.targetDonorId = current?.[0]?.id ?? '';
      }
    }
    if ('open' in changes && changes['open'].currentValue === true) {
      this.targetDonorId = this.donors[0]?.id ?? this.targetDonorId;
    }
  }

  protected onTargetDonorChange(donorId: string): void {
    this.targetDonorId = donorId;
  }

  protected get sourceDonor(): Donor | undefined {
    return this.donors.find(donor => donor.id !== this.targetDonorId);
  }

  protected get targetDonor(): Donor | undefined {
    return this.donors.find(donor => donor.id === this.targetDonorId);
  }

  protected formatPhone(donor?: Donor): string {
    if (!donor?.phoneNumber) {
      return '-';
    }
    return `${donor.phoneCode ?? ''}${donor.phoneNumber}`.trim();
  }

  onDismissed(): void {
    this.closed.emit();
  }

  onConfirm(): void {
    const source = this.sourceDonor;
    const target = this.targetDonor;
    if (!source || !target) {
      return;
    }
    this.confirmed.emit({
      sourceDonorId: source.id,
      targetDonorId: target.id,
    });
  }
}
