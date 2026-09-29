import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

/** Redirects legacy master-data / content admin routes to the JSON Store console. */
@Component({
  selector: 'app-json-store-ns-redirect',
  standalone: true,
  template: '',
})
export class JsonStoreNsRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const ns =
      this.route.snapshot.paramMap.get('namespace')
      ?? this.route.snapshot.data['namespace']
      ?? '';
    void this.router.navigate([AppRoute.secured_admin_json_store_page.url], {
      queryParams: ns ? { ns } : {},
      replaceUrl: true,
    });
  }
}
