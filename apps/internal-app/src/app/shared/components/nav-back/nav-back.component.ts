import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-back',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-back.component.html',
  styleUrls: ['./nav-back.component.scss'],
})
export class NavBackComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @Input({ required: true }) fallbackLink!: string;
  @Input({ required: true }) fallbackLabel!: string;

  protected get link(): string {
    return this.route.snapshot.queryParamMap.get('backTo') ?? this.fallbackLink;
  }

  protected get label(): string {
    return this.route.snapshot.queryParamMap.get('backLabel') ?? this.fallbackLabel;
  }

  protected onClick(event: Event): void {
    event.preventDefault();
    void this.router.navigateByUrl(this.link);
  }
}
