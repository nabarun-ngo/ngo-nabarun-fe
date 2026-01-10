import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { ModalService } from 'src/app/core/service/modal.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { compareObjects } from 'src/app/core/service/utilities.service';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Donation } from '../../model';
import { DonationService } from '../../service/donation.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { MemberDonationTabComponent } from '../member-donation-tab/member-donation-tab.component';
import { DmsUploadDto, DocMapDto } from 'src/app/core/api-client/models';
import { getDocumentDetailSection } from 'src/app/feature/workflow/fields/request.field';
import { donationDocumentSection } from '../../fields/donation.field';

export interface BulkEditConfig {
    /** Title to display in the header */
    title?: string;
    /** Fields that should be locked/disabled during bulk edit */
    lockedFields?: string[];
    /** Whether to show document upload section */
    showDocuments?: boolean;
    /** Return URL after successful update */
    returnUrl?: string;
    /** Additional validation rules */
    customValidations?: { [fieldName: string]: any[] };
}

@Component({
    selector: 'app-bulk-edit-donation',
    templateUrl: './bulk-edit-donation.component.html',
    styleUrls: ['./bulk-edit-donation.component.scss']
})
export class BulkEditDonationComponent extends MemberDonationTabComponent {

    protected loading: boolean = true;
    protected donationIds: string[] = [];
    protected donations: Donation[] = [];
    protected config: BulkEditConfig = {};
    protected canUpdate: boolean = false;

    constructor(
        protected override route: ActivatedRoute,
        protected override router: Router,
        protected location: Location,
        protected override donationService: DonationService,
        protected override identityService: UserIdentityService,
        protected override modalService: ModalService
    ) {
        super(donationService, identityService, modalService, router, route);
        this.canUpdate = this.identityService.isAccrediatedTo(SCOPE.update.donation);
    }

    override onInitHook(): void {
        // Check permissions
        if (!this.canUpdate) {
            this.modalService.openNotificationModal(
                { title: 'Access Denied', description: 'You do not have permission to update donations' },
                'notification',
                'error'
            );
            this.goBack();
            return;
        }

        // Get donation IDs from query params
        this.route.queryParams.subscribe(async params => {
            const idsParam = params['ids'];
            if (!idsParam) {
                this.modalService.openNotificationModal(
                    { title: 'Error', description: 'No donation IDs provided' },
                    'notification',
                    'error'
                );
                this.goBack();
                return;
            }

            this.donationIds = idsParam.split(',').map((id: string) => id.trim());

            // Get configuration from route data
            this.route.data.subscribe(data => {
                this.config = {
                    title: data['title'] || 'Bulk Edit Donations',
                    lockedFields: data['lockedFields'] || ['amount', 'type'],
                    showDocuments: data['showDocuments'] !== false,
                    returnUrl: data['returnUrl'],
                    customValidations: data['customValidations'] || {}
                };
            });

            await this.loadDonations();
        });
    }

    protected override prepareDetailedView(data: Donation, options?: { [key: string]: any; }): DetailedView[] {
        return [
            ...super.prepareDetailedView(data, options),
            donationDocumentSection([])
        ];
    }

    private async loadDonations(): Promise<void> {
        try {
            this.loading = true;
            // Fetch accounts and ref data
            const [accountsData, refDataResult] = await Promise.all([
                firstValueFrom(this.donationService.fetchPayableAccounts()),
                firstValueFrom(this.donationService.fetchRefData())
            ]);

            this.payableAccounts = accountsData;
            this.setRefData(refDataResult as { [name: string]: KeyValue[]; });

            // Get donations from navigation state (passed from previous page)
            const navigation = this.router.getCurrentNavigation();
            const state = navigation?.extras?.state || window.history.state;

            if (state && state['donations']) {
                this.donations = state['donations'];
            } else {
                // If no state, show error
                this.modalService.openNotificationModal(
                    { title: 'Error', description: 'No donation data provided. Please select donations and try again.' },
                    'notification',
                    'error'
                );
                this.goBack();
                return;
            }

            // Validate donations
            if (!this.donations || this.donations.length === 0) {
                this.modalService.openNotificationModal(
                    { title: 'Error', description: 'No donations found for the provided IDs' },
                    'notification',
                    'error'
                );
                this.goBack();
                return;
            }
            if (!this.validateDonations(this.donations)) {
                this.goBack();
                return;
            }

            // Use the first donation as template
            const template: Donation = {
                ...this.donations[0],
                id: this.donationIds.join(', ')
            };

            // Set content in Accordion
            this.setContent([template]);


            // Setup form logic
            this.handleUpdateDonation(0);

            this.loading = false;
        } catch (error) {
            console.error('Error loading donations:', error);
            this.modalService.openNotificationModal(
                { title: 'Error', description: 'Failed to load donation data' },
                'notification',
                'error'
            );
            this.goBack();
        }
    }


    get currentDetailedViews(): DetailedView[] {
        return this.getAccordionList().contents[0]?.detailed || [];
    }

    // --- Actions ---

    protected async onSubmit(): Promise<void> {
        const rowIndex = 0;
        const donation_form = this.getSectionForm('donation_detail', rowIndex);
        const documents = this.getSectionDocuments('document_list', rowIndex);
        donation_form?.markAllAsTouched();

        console.log(donation_form);
        console.log(documents);

        if (!donation_form?.valid) {
            this.modalService.openNotificationModal(
                { title: 'Validation Error', description: 'Please fill all required fields correctly' },
                'notification',
                'error'
            );
            return;
        }

        const formValue = donation_form.value;

        // Validate documents for PAID status
        if (formValue.status === 'PAID' && formValue.paymentMethod !== 'CASH' && (!documents || documents.length === 0)) {
            this.modalService.openNotificationModal(
                { title: 'Error', description: 'Please upload a document for the donation payment' },
                'notification',
                'error'
            );
            return;
        }

        try {
            this.loading = true;
            const docMapping: DocMapDto[] = [];

            for (const id of this.donationIds) {
                const originalDon = this.donations.find(d => d.id === id)!;
                const updatedData = compareObjects(formValue, originalDon);
                const updated = await firstValueFrom(this.donationService.updateDonation(id, updatedData, []));
                docMapping.push({
                    entityId: updated.id,
                    entityType: 'DONATION',
                })
                if (updated.transactionRef) {
                    docMapping.push({
                        entityId: updated.transactionRef,
                        entityType: 'TRANSACTION',
                    })
                }
            }

            if (documents) {
                const dmsDtos: DmsUploadDto[] = documents.map(doc => ({
                    contentType: doc.detail.contentType,
                    fileBase64: doc.detail.base64Content,
                    filename: doc.detail.originalFileName,
                    documentMapping: docMapping,
                }))
                await firstValueFrom(this.donationService.uploadDocuments(dmsDtos))
            }

            this.modalService.openNotificationModal(
                {
                    title: 'Success',
                    description: `Successfully updated ${this.donationIds.length} donation(s)`
                },
                'notification',
                'success'
            );

            this.goBack();
        } catch (error) {
            console.error('Error updating donations:', error);
            // this.modalService.openNotificationModal(
            //     { title: 'Error', description: 'Failed to update donations' },
            //     'notification',
            //     'error'
            // );
            this.loading = false;
        }
    }

    protected onCancel(): void {
        this.goBack();
    }

    private goBack(): void {
        if (this.config.returnUrl) {
            this.router.navigateByUrl(this.config.returnUrl);
        } else {
            this.location.back();
        }
    }

    override loadData(): void { }
    override onSearch($event: SearchEvent): void { }
    override onClick(event: { buttonId: string; rowIndex: number; }): void { }
    override onAccordionOpen(event: { rowIndex: number; }): void { }
    override handlePageEvent(event: any): void { }
    override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
        return [];
    }
    override prepareHighLevelView(data: Donation, options?: { [key: string]: any; }): AccordionCell[] {
        return [];
    }
    override ngAfterContentInit(): void {
        // Override to prevent clearing content, we manage it manually
    }



}
