import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { AlertData } from 'src/app/shared/model/alert.model';

@Component({
    selector: 'app-document-viewer',
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.scss']
})
export class DocumentViewerComponent implements OnInit {
    protected url: string | null = null;
    protected title: string | null = null;

    protected navigations: NavigationButtonModel[] = [
        {
            displayName: 'Back to Help',
            routerLink: AppRoute.secured_dashboard_help_page.url,
        },
    ];

    alertData: AlertData = {
        alertType: 'warning',
        message: 'The document might take a few moments to load depending on your internet connection.',
        destroyAfter: 30
    };

    constructor(private route: ActivatedRoute,
        private router: Router,
        private sharedData: SharedDataService,

    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            this.title = params.get('title');
            this.sharedData.setPageName(this.title ?? 'View Document');
            this.url = params.get('url');
            if (!this.url) {
                this.router.navigate([AppRoute.secured_dashboard_help_page.url]);
            }
        });
    }

    close() {
        if (window.opener) {
            window.close();
        } else {
            this.router.navigate([AppRoute.secured_dashboard_help_page.url]);
        }
    }
}
