import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import type { Account, AccountRefData } from '../../domain';
import {
  AccountSummaryCardView,
  buildAccountSummaryCardView,
} from './account-summary-card.mapper';

@Component({
  selector: 'app-account-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-summary-card.component.html',
  styleUrls: ['./account-summary-card.component.scss'],
})
export class AccountSummaryCardComponent implements OnChanges {
  @Input() account?: Account;
  @Input() refData: AccountRefData = {};

  protected view?: AccountSummaryCardView;
  protected detailsExpanded = false;

  ngOnChanges(): void {
    this.view = this.account
      ? buildAccountSummaryCardView(this.account, this.refData)
      : undefined;
  }

  toggleDetails(): void {
    this.detailsExpanded = !this.detailsExpanded;
  }
}
