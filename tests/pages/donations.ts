import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";
import { AppAlert } from "src/app/core/constant/app-alert.const";

export class DonationPage extends BasePage {

    protected readonly myDonationTabEl: string = "//span[contains(text(),'My Donations')]";
    protected readonly guestDonationTabEl: string = "//span[contains(text(),'Guest Donations')]";
    protected readonly memberDonationTabEl: string = "//span[contains(text(),'Member Donations')]";
    protected readonly allDonationTabEl: string = "//span[contains(text(),'All Donations')]";
    protected readonly addGuestDonationBtnEl: string = '//button[contains(text(),"Add Guest Donation")]';
    protected readonly guestFullNameEl: string = '//input[@formcontrolname="fullName"]';
    protected readonly guestEmailEl: string = '//input[@formcontrolname="email"]';
    protected readonly guestPhoneNumberEl: string = '//input[@formcontrolname="primaryNumber"]';
    protected readonly donationAmountEL: string = '//div[contains(text(),"Donation amount")]/following-sibling::div//input';
    protected readonly donationTypeEl: string = '//div[contains(text(),"Donation type")]/following-sibling::div//mat-select';
    protected readonly donationEventNoEl: string = '//label[@for="no"]';
    protected readonly donationEventYesEl: string = '//label[@for="yes"]';
    protected readonly donationEventEl: string = '//div[contains(text(),"Select event")]/following-sibling::div//mat-select';
    protected readonly donationCreateBtnEl: string = '//span[normalize-space()="Create"]';
    protected readonly expansionPanelsEl: string = '//span[contains(@class,"mat-expansion-indicator")]';

    protected readonly memberFirstExpansionPanelEl: string = '(//app-donation-accordion//span[contains(@class,"mat-expansion-indicator")])[1]';

    protected readonly firstExpansionPanelEl: string = '(//span[contains(@class,"mat-expansion-indicator")])[1]';
    protected readonly donationNumber1stRowEL: string = '(//div[contains(text(),"Donation number")]/following-sibling::div)[1]';
    protected readonly searchFldEl: string = "#simple-search";
    protected readonly advSearchBtnEl: string = "//button[contains(text(),'Advanced Search')]";
    protected readonly advSearchSearchBtnEl: string = "//button[normalize-space(text())='Search']";
    protected readonly advSearchCloseBtnEl: string = "//button[normalize-space(text())='Close']";
    protected readonly donationNumberSearchEl: string = "#donationId";
    protected readonly donorNameSearchEl: string = "#donorName";
    protected readonly memberSearchFirstNameEl: string = "#firstName";
    protected readonly memberSearchLastNameEl: string = "#lastName";

    protected readonly donationUpdateBtnEl: string = '//span[normalize-space()="Update"]';
    protected readonly donationStatusEL: string = '//div[contains(text(),"Donation status")]/following-sibling::div//mat-select';
    protected readonly donationPaidOnEL: string = '//div[contains(text(),"Donation paid on")]/following-sibling::div//mat-datepicker-toggle';
    protected readonly donationPaymentMethodEL: string = '//div[contains(text(),"Payment method")]/following-sibling::div//mat-select';
    protected readonly donationPaidToEL: string = '//div[contains(text(),"Donation paid to")]/following-sibling::div//mat-select';
    protected readonly payUPINameEL: string = '//div[contains(text(),"UPI name")]/following-sibling::div//mat-select';
    protected readonly fileUploadEL: string = '//*[contains(text(),"Upload document")]/following-sibling::*//label';
    protected readonly donationConfirmBtnEl: string = '//span[normalize-space()="Confirm"]';

    protected readonly paymentFailureDetailEL: string = '//*[contains(text(),"Payment failure details")]/following-sibling::div//textarea';
    protected readonly reasonForCancelEL: string = '//*[contains(text(),"Reason for cancel")]/following-sibling::div//textarea';
    protected readonly reasonForPayLaterEL: string = '//*[contains(text(),"Reason for paying later")]/following-sibling::div//textarea';
    protected readonly addMemberDonationEl: string = "//mat-icon[@role='img'][normalize-space()='add']";
    protected readonly donationStartDateEL: string = '//div[contains(text(),"Donation start date")]/following-sibling::div//mat-datepicker-toggle';
    protected readonly donationEndDateEL: string = '//div[contains(text(),"Donation end date")]/following-sibling::div//mat-datepicker-toggle';

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.page = page;
    }

    async addGuestDonation(data: {
        name: string,
        email: string,
        phoneNo: string,
        amount: number,
        eventIndex?: number;
    }) {
        await this.page.click(this.addGuestDonationBtnEl);
        await this.page.fill(this.guestFullNameEl, data.name);
        await this.page.fill(this.guestEmailEl, data.email);
        await this.page.fill(this.guestPhoneNumberEl, data.phoneNo);
        await this.select(this.donationTypeEl, 'One Time');
        await this.page.fill(this.donationAmountEL, data.amount + '');
        if (data.eventIndex) {
            await this.page.click(this.donationEventYesEl);
            await this.selectByIndex(this.donationEventEl, data.eventIndex);
        } else {
            await this.page.click(this.donationEventNoEl);
        }
        await this.page.click(this.donationCreateBtnEl);
        await expect.soft(this.page.locator(this.alertEL)).toContainText(AppAlert.donation_created.message)

        await this.page.click(this.firstExpansionPanelEl);
        let donationNumber = await this.getLocator(this.donationNumber1stRowEL).textContent()
        await this.page.click(this.firstExpansionPanelEl);
        return donationNumber;
    }

    async searchAndAddMemberDonation(data: {
        member: {
            firstName?: string,
            lastName?: string,
        },
        donationType: string,
        amount: number,
        startDate?: Date,
        endDate?: Date,
        eventIndex?: number;
    }) {
        // await this.gotoTab('member');
        await this.search(undefined, {
            member: {
                firstName: data.member.firstName!,
                lastName: data.member.lastName!
            }
        })
        await this.page.click(this.firstExpansionPanelEl);
        await this.page.click(this.addMemberDonationEl);
        await this.select(this.donationTypeEl, data.donationType);
        await this.page.fill(this.donationAmountEL, data.amount + '');

        if (data.donationType == 'Regular') {
            await this.selectdate(this.donationStartDateEL, data.startDate!);
            await this.selectdate(this.donationEndDateEL, data.endDate!);
        } else if (data.eventIndex) {
            await this.page.click(this.donationEventYesEl);
            await this.selectByIndex(this.donationEventEl, data.eventIndex);
        } else {
            await this.page.click(this.donationEventNoEl);

        }
        await this.page.click(this.donationCreateBtnEl);
        await expect.soft(this.page.locator(this.alertEL)).toContainText(AppAlert.donation_created.message)

        await this.page.click(this.memberFirstExpansionPanelEl);
        let donationNumber = await this.getLocator(this.donationNumber1stRowEL).textContent()
        await this.page.click(this.memberFirstExpansionPanelEl);
        return donationNumber;
    }


    async search(search?: string, advancedSearch?: {
        donationId?: string;
        donorName?: string;
        close?: boolean,
        isAdvSearchAlreadyOpen?: boolean,
        member?: {
            firstName: string,
            lastName: string
        }
    }) {
        if (search) {
            await this.page.click(this.searchFldEl);
            await this.keyboardType(search);
        } else if (advancedSearch) {
            if (advancedSearch.close) {
                await this.page.click(this.advSearchCloseBtnEl);
            } else {
                if (!advancedSearch.isAdvSearchAlreadyOpen) {
                    await this.page.click(this.advSearchBtnEl);
                }
                if (advancedSearch.donationId) {
                    await this.page.fill(this.donationNumberSearchEl, advancedSearch.donationId);
                }
                if (advancedSearch.donorName) {
                    await this.page.fill(this.donorNameSearchEl, advancedSearch.donorName);
                }
                if (advancedSearch.member) {
                    await this.page.fill(this.memberSearchFirstNameEl, advancedSearch.member.firstName);
                    await this.page.fill(this.memberSearchLastNameEl, advancedSearch.member.lastName);
                }
                await this.page.click(this.advSearchSearchBtnEl);
            }
        }
    }


    async updateDonation(data: {
        file?: string;
        upiName?: string;
        paidTO?: string;
        paymentMethod?: string;
        paidOn?: Date;
        id: string;
        amount?: string;
        donorInfo?: {
            email?: string;
            name?: string;
            phoneNo?: string;
        };
        status?: string;
        comment?: string;
    }) {
        await this.page.click(this.firstExpansionPanelEl)
        await this.page.click(this.donationUpdateBtnEl)
        if (data.amount) {
            await this.page.fill(this.donationAmountEL, data.amount)
        }
        if (data.status) {
            await this.select(this.donationStatusEL, data.status)
        }

        if (data.status?.toLowerCase() == 'paid') {

            //TODO
            await this.selectdate(this.donationPaidOnEL, data.paidOn!)
            await this.select(this.donationPaymentMethodEL, data.paymentMethod!)
            await this.select(this.donationPaidToEL, data.paidTO!)

            if (data.paymentMethod!.toLowerCase() == 'upi') {
                await this.select(this.payUPINameEL, data.upiName!)
            }

            if (data.paymentMethod!.toLowerCase() != 'cash') {
                await this.uploadFile(this.fileUploadEL, data.file!);
            }
        }

        if (data.status?.toLowerCase() == 'payment failed') {
            await this.page.fill(this.paymentFailureDetailEL, data.comment!);
        }
        if (data.status?.toLowerCase() == 'cancelled') {
            await this.page.fill(this.reasonForCancelEL, data.comment!);
        }
        if (data.status?.toLowerCase() == 'pay later') {
            await this.page.fill(this.reasonForPayLaterEL, data.comment!);
        }
        await this.page.click(this.donationConfirmBtnEl)
        await expect.soft(this.page.locator(this.alertEL)).toContainText(AppAlert.donation_updated.message)
        await this.page.locator('#alertDismiss').waitFor({ timeout: 1000 }).catch(() => {});
        if (await this.page.locator('#alertDismiss').isVisible()) {
            this.page.click('#alertDismiss');
        }
        await this.captureScreenshot('donation update')
    }


    async gotoTab(tab: 'guest' | 'self' | 'member'|'all') {
        if (tab == 'guest') {
            await this.page.click(this.guestDonationTabEl)
        }else if(tab == 'self'){
            await this.page.click(this.myDonationTabEl)

        }else if(tab == 'member'){
            await this.page.click(this.memberDonationTabEl)

        }else if(tab == 'all'){
            await this.page.click(this.allDonationTabEl)

        }
    }

    async checkDonationStatus(status: string,isMember?:boolean) {
        if(isMember){
            await this.page.click(this.memberFirstExpansionPanelEl)
        }else{
            await this.page.click(this.firstExpansionPanelEl)
        }
        let text = await this.getLocator('(//div[contains(text(),"Donation status")]/following-sibling::div)[1]').textContent();
        expect.soft(text!.trim()).toBe(status.trim());
        await this.page.click(this.firstExpansionPanelEl)
    }

}