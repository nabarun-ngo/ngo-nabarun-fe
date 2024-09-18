import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";
import { AppAlert } from "src/app/core/constant/app-alert.const";

export class DonationPage extends BasePage {
    

    protected readonly myDonationEl: Locator;
    protected readonly guestDonationEl: Locator;
    protected readonly memberDonationEl: Locator;
    protected readonly addGuestDonationBtnEl: Locator;
    protected readonly guestFullNameEl: Locator;
    protected readonly guestEmailEl: Locator;
    protected readonly guestPhoneNumberEl: Locator;
    protected readonly donationAmountEL: Locator;
    protected readonly donationTypeEl: Locator;
    protected readonly donationEventNoEl: Locator;
    protected readonly donationCreateBtnEl: Locator;
    protected readonly firstExpansionPanelEl: Locator;
    protected readonly donationNumber1stRowEL: Locator;
    protected readonly searchFldEl: Locator;
    protected readonly advSearchBtnEl: Locator;
    protected readonly advSearchSearchBtnEl: Locator;
    protected readonly advSearchCloseBtnEl: Locator;
    protected readonly donationNumberSearchEl: Locator;
    protected readonly donationUpdateBtnEl: Locator;
    protected readonly donationStatusEL: Locator;
    protected readonly donationPaidOnEL: Locator;
    protected readonly donationPaymentMethodEL: Locator;
    protected readonly donationPaidToEL: Locator;
    protected readonly payUPINameEL: Locator;
    protected readonly fileUploadEL: Locator;
    protected readonly donationConfirmBtnEl: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.page = page;
        this.myDonationEl = page.locator("//span[contains(text(),'My Donations')]");
        this.guestDonationEl = page.locator("//span[contains(text(),'Guest Donations')]");
        this.memberDonationEl = page.locator("//span[contains(text(),'Member Donations')]");
        this.addGuestDonationBtnEl = page.locator('//button[contains(text(),"Add Guest Donation")]');
        this.guestFullNameEl = page.locator('//input[@formcontrolname="fullName"]');
        this.guestEmailEl = page.locator('//input[@formcontrolname="email"]');
        this.guestPhoneNumberEl = page.locator('//input[@formcontrolname="primaryNumber"]');


        this.donationTypeEl = page.locator('//div[contains(text(),"Donation type")]/following-sibling::div//mat-select');
        this.donationAmountEL = page.locator('//div[contains(text(),"Donation amount")]/following-sibling::div//input');
        this.donationEventNoEl = page.locator('//label[@for="no"]');
        this.donationCreateBtnEl = page.locator('//span[normalize-space()="Create"]');
        this.donationUpdateBtnEl = page.locator('//span[normalize-space()="Update"]');
        this.donationConfirmBtnEl = page.locator('//span[normalize-space()="Confirm"]');

        this.firstExpansionPanelEl=page.locator('(//span[contains(@class,"mat-expansion-indicator")])[1]');
        this.donationNumber1stRowEL = page.locator('(//div[contains(text(),"Donation number")]/following-sibling::div)[1]');

        this.advSearchBtnEl = page.locator("//button[contains(text(),'Advanced Search')]");
        this.searchFldEl = page.locator("#simple-search");
        this.advSearchSearchBtnEl = page.locator("//button[normalize-space(text())='Search']");
        this.advSearchCloseBtnEl = page.locator("//button[normalize-space(text())='Close']");
        this.donationNumberSearchEl = page.locator("#donationId")

        this.donationStatusEL = page.locator('//div[contains(text(),"Donation status")]/following-sibling::div//mat-select');
        this.donationPaidOnEL = page.locator('//div[contains(text(),"Donation paid on")]/following-sibling::div//mat-datepicker-toggle');
        this.donationPaymentMethodEL = page.locator('//div[contains(text(),"Payment method")]/following-sibling::div//mat-select');
        this.donationPaidToEL = page.locator('//div[contains(text(),"Donation paid to")]/following-sibling::div//mat-select');
        this.payUPINameEL = page.locator('//div[contains(text(),"UPI name")]/following-sibling::div//mat-select');
        this.fileUploadEL = page.locator('//*[contains(text(),"Upload document")]/following-sibling::*//label');

    }

    async addGuestDonation(data: {
        name: string,
        email: string,
        phoneNo: string,
        amount: number
    }) {
        await this.gotoTab('guest');
        await this.click(this.addGuestDonationBtnEl);
        await this.enter(this.guestFullNameEl, data.name);
        await this.enter(this.guestEmailEl, data.email);
        await this.enter(this.guestPhoneNumberEl, data.phoneNo);
        await this.select(this.donationTypeEl, 'One Time');
        await this.enter(this.donationAmountEL, data.amount + '');
        await this.click(this.donationEventNoEl);
        await this.click(this.donationCreateBtnEl);
        //await expect.soft(this.firstRowEl).toContainText(data.name, { timeout: 30000 });
        await this.assertText(this.alertEL,AppAlert.donation_created.message)
        await this.click(this.firstExpansionPanelEl);
        let donationNumber=await this.getTextOrValue(this.donationNumber1stRowEL)
        await this.click(this.firstExpansionPanelEl);
        return donationNumber;
    }


    async search(search?: string, advancedSearch?: { donationId?: string; close?: boolean }) {
        if (search) {
            await this.click(this.searchFldEl);
            await this.keyboardType(search);
        } else if (advancedSearch) {
            if (advancedSearch.close) {
                await this.click(this.advSearchCloseBtnEl);
            } else {
                await this.click(this.advSearchBtnEl);
                if (advancedSearch.donationId) {
                    await this.enter(this.donationNumberSearchEl, advancedSearch.donationId);
                }
                await this.click(this.advSearchSearchBtnEl);
            }
        }
    }
    

    async updateDonation(data: {
        file?: string;
        upiName?: string;
        paidTO?: string;
        paymentMethod?: string;
        paidOn?: string;
        id: string;
        amount?: string;
        donorInfo?:{
            email?: string;
            name?: string;
            phoneNo?: string;
        };
       status?:string;
    }) {
        await this.click(this.firstExpansionPanelEl)
        await this.click(this.donationUpdateBtnEl)
        if(data.amount){
            await this.enter(this.donationAmountEL,data.amount)
        }
        if(data.status){
            await this.select(this.donationStatusEL,data.status)
        }

        if(data.status?.toLowerCase() == 'paid'){
            await this.selectdate(this.donationPaidOnEL,{
                year:'2024',
                month:'JAN',
                date:'31'
            })
            await this.select(this.donationPaymentMethodEL,data.paymentMethod!)
            await this.select(this.donationPaidToEL,data.paidTO!)

            if(data.paymentMethod!.toLowerCase() == 'upi'){
                await this.select(this.payUPINameEL,data.upiName!)
            }

            if(data.paymentMethod!.toLowerCase() != 'cash'){
                await this.uploadFile(this.fileUploadEL,data.file!);
            }
        }

        await this.click(this.donationConfirmBtnEl)
        //Assert
        await this.assertText(this.alertEL,AppAlert.donation_updated.message)
    }
   

    async gotoTab(tab:'guest'|'self'|'member') {
        if(tab =='guest'){
            await this.click(this.guestDonationEl)
        }
    }

}