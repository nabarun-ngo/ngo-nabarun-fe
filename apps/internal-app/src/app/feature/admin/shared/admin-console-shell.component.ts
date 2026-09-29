import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';

@Component({
  selector: 'app-admin-console-shell',
  standalone: true,
  imports: [CommonModule, NavBackComponent],
  template: `
    <div class="admin-console-shell">
      <section class="admin-console-shell__content">
        <app-nav-back
          [fallbackLink]="adminBackLink"
          fallbackLabel="Admin">
        </app-nav-back>
        <ng-content></ng-content>
      </section>
    </div>
  `,
  styles: [`
    .admin-console-shell {
      padding: 14px 8px 24px;
      min-height: 100%;
      background: var(--mobile-page-gradient);
    }
    .admin-console-shell__content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    @media (min-width: 768px) {
      .admin-console-shell {
        padding: 0;
        background: transparent;
      }
    }
  `],
})
export class AdminConsoleShellComponent implements OnChanges, OnInit {
  @Input() pageTitle = 'Admin';

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  private readonly shared = inject(SharedDataService);

  ngOnInit(): void {
    this.shared.setPageName(this.pageTitle);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageTitle'] && !changes['pageTitle'].firstChange) {
      this.shared.setPageName(this.pageTitle);
    }
  }
}
