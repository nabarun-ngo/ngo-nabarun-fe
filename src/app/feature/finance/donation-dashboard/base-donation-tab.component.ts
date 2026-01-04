import { Component, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { compareObjects } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { Accordion } from 'src/app/shared/utils/accordion';
import { donationDocumentSection, DonationFieldVisibilityRules, getDonationSection } from '../fields/donation.field';
import { DonationDefaultValue } from '../finance.const';
import { Account, Donation, PagedDonations } from '../model';
import { DonationService } from '../service/donation.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { ModalService } from 'src/app/core/service/modal.service';
import { AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';

@Component({
    template: ''
})
export abstract class BaseDonationTabComponent extends Accordion<Donation> implements TabComponentInterface<PagedDonations>, OnDestroy {
    protected formSubscription?: Subscription;
    protected permissions: { canCreateDonation: boolean; canUpdateDonation: boolean; } | undefined;


    @Input()
    payableAccounts: Account[] = [];

    constructor(
        protected donationService: DonationService,
        protected identityService: UserIdentityService,
        protected modalService: ModalService
    ) {
        super();
        this.permissions = {
            canCreateDonation: this.identityService.isAccrediatedTo(SCOPE.create.donation),
            canUpdateDonation: this.identityService.isAccrediatedTo(SCOPE.update.donation),
        }
    }

    ngOnDestroy(): void {
        this.formSubscription?.unsubscribe();
    }

    // Common Pagination Config
    protected get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
        return {
            pageNumber: DonationDefaultValue.pageNumber,
            pageSize: DonationDefaultValue.pageSize,
            pageSizeOptions: DonationDefaultValue.pageSizeOptions
        };
    }

    protected override prepareDetailedView(data: Donation, options?: { [key: string]: any; }): DetailedView[] {
        return [
            getDonationSection(
                data,
                this.getRefData({ isActive: true }) || {},
                this.payableAccounts.map(acc => ({ key: acc.id, displayValue: acc.accountHolderName || '' })),
                [],
                options && options['create'],
                options && options['guest']
            ),
        ];
    }

    protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
        ////console.log(event, this.activeButtonId);
        if (event.buttonId === 'UPDATE_DONATION') {
            this.activeButtonId = event.buttonId;
            this.handleUpdateDonation(event.rowIndex);
        }
        else if (event.buttonId === 'CANCEL' && this.activeButtonId === 'UPDATE_DONATION') {
            this.formSubscription?.unsubscribe();
            this.hideForm(event.rowIndex);
        }
        else if (event.buttonId === 'CONFIRM' && this.activeButtonId === 'UPDATE_DONATION') {
            this.handleConfirmUpdate(event.rowIndex);
        }
        else if (event.buttonId === 'CANCEL_CREATE') {
            this.formSubscription?.unsubscribe();
            this.hideForm(0, true);
        }
        else if (event.buttonId === 'CONFIRM_CREATE') {
            this.handleConfirmCreate();
        }
    }
    protected abstract handleConfirmCreate(): void;

    protected initCreateDonationForm(isGuest: boolean) {
        //console.log(this.permissions);
        this.showCreateForm();
        setTimeout(() => {
            this.formSubscription = this.setupFieldVisibilityRules('donation_detail', 0, DonationFieldVisibilityRules, true);
            this.updateFieldValidators('donation_detail', 0, {
                'amount': [Validators.required],
                'type': isGuest ? [] : [Validators.required],
            }, true);
        }, 0);
    }

    protected handleUpdateDonation(rowIndex: number): void {
        this.showEditForm(rowIndex, this.getEditFormSections());

        setTimeout(() => {
            this.formSubscription = this.setupFieldVisibilityRules('donation_detail', rowIndex, DonationFieldVisibilityRules);
            const form = this.getSectionForm('donation_detail', rowIndex);
            this.formSubscription?.add(
                form?.get('status')?.valueChanges.subscribe((status: any) => {
                    const isPaid = status === 'PAID';
                    this.updateFieldValidators('donation_detail', rowIndex, {
                        'paidOn': isPaid ? [Validators.required] : [],
                        'paidToAccountId': isPaid ? [Validators.required] : [],
                        'paymentMethod': isPaid ? [Validators.required] : [],
                        'paidUsingUPI': isPaid && form?.get('paymentMethod')?.value === 'UPI' ? [Validators.required] : [],
                        'cancellationReason': status === 'CANCELLED' ? [Validators.required] : [],
                        'laterPaymentReason': status === 'PAY_LATER' ? [Validators.required] : [],
                        'paymentFailureDetail': status === 'PAYMENT_FAILED' ? [Validators.required] : []
                    });
                })
            );

            // Trigger initial validation update
            form?.get('status')?.updateValueAndValidity({ emitEvent: true });
        }, 0);

        this.donationService.fetchPayableAccounts().subscribe((accounts: Account[]) => {
            const accountOptions = accounts.map(a => ({
                key: a.id,
                displayValue: a.displayName
            }));
            this.updateFieldOptions('donation_detail', rowIndex, 'paidToAccountId', accountOptions);
        });
    }

    protected handleConfirmUpdate(rowIndex: number): void {
        const donation = this.itemList[rowIndex];
        const forms = this.getFormsToValidate(rowIndex);
        const allValid = forms.every(f => f?.valid);
        if (allValid) {
            const donationForm = this.getSectionForm('donation_detail', rowIndex);
            const documents = this.getSectionDocuments('document_list', rowIndex);
            const donationFormValue = { ...donationForm?.value } as Donation;
            //console.log(donationFormValue);
            if (donationFormValue.status === 'PAID' && donationFormValue.paymentMethod !== 'CASH' && documents?.length == 0) {
                this.modalService.openNotificationModal({
                    description: 'Please upload a document for the donation payment',
                    title: 'Error',
                }, 'notification', 'error')
                return;
            }
            this.donationService.updateDonation(donation.id, compareObjects(donationFormValue, donation), documents).subscribe((data: Donation) => {
                this.hideForm(rowIndex);
                this.updateContentRow(data, rowIndex);
            });
        } else {
            forms.forEach(f => f?.markAllAsTouched());
        }
    }

    /**
     * Returns the list of sections to show in the edit form.
     * Can be overridden by child components.
     */
    protected getEditFormSections(): string[] {
        return ['donation_detail', 'document_list'];
    }

    /**
     * Returns the list of forms to validate on confirm.
     * Can be overridden by child components.
     */
    protected getFormsToValidate(rowIndex: number): FormGroup[] {
        return [this.getSectionForm('donation_detail', rowIndex)!];
    }

    protected override onAccordionOpen(event: { rowIndex: number; }): void {
        const donationId = this.itemList[event.rowIndex].id;
        this.donationService.fetchDocuments(donationId).subscribe(data => {
            this.addSectionInAccordion(donationDocumentSection(data), event.rowIndex);
        });
    }

    protected override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
        if (options && options['create']) {
            return [
                {
                    button_id: 'CANCEL_CREATE',
                    button_name: 'Cancel',
                },
                {
                    button_id: 'CONFIRM_CREATE',
                    button_name: 'Confirm',
                },
            ];
        }
        return [
            {
                button_id: 'UPDATE_DONATION',
                button_name: 'Update'
            }
        ];
    }

    abstract loadData(): void;
    abstract onSearch($event: SearchEvent): void;
}
