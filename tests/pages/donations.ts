import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";
import { AppAlert } from "src/app/core/constant/app-alert.const";

export class DonationPage extends BasePage {

    protected readonly myDonationEl: string ="//span[contains(text(),'My Donations')]";
    protected readonly guestDonationEl: string ="//span[contains(text(),'Guest Donations')]";
    protected readonly memberDonationEl: string ="//span[contains(text(),'Member Donations')]";
    protected readonly addGuestDonationBtnEl: string ='//button[contains(text(),"Add Guest Donation")]';
    protected readonly guestFullNameEl: string ='//input[@formcontrolname="fullName"]';
    protected readonly guestEmailEl: string ='//input[@formcontrolname="email"]';
    protected readonly guestPhoneNumberEl: string ='//input[@formcontrolname="primaryNumber"]';
    protected readonly donationAmountEL: string ='//div[contains(text(),"Donation amount")]/following-sibling::div//input';
    protected readonly donationTypeEl: string ='//div[contains(text(),"Donation type")]/following-sibling::div//mat-select';
    protected readonly donationEventNoEl: string ='//label[@for="no"]';
    protected readonly donationCreateBtnEl: string ='//span[normalize-space()="Create"]';
    protected readonly firstExpansionPanelEl: string ='(//span[contains(@class,"mat-expansion-indicator")])[1]';
    protected readonly donationNumber1stRowEL: string ='(//div[contains(text(),"Donation number")]/following-sibling::div)[1]';
    protected readonly searchFldEl: string ="#simple-search";
    protected readonly advSearchBtnEl: string ="//button[contains(text(),'Advanced Search')]";
    protected readonly advSearchSearchBtnEl: string ="//button[normalize-space(text())='Search']";
    protected readonly advSearchCloseBtnEl: string ="//button[normalize-space(text())='Close']";
    protected readonly donationNumberSearchEl: string ="#donationId";
    protected readonly donorNameSearchEl: string ="#donorName";
    protected readonly donationUpdateBtnEl: string ='//span[normalize-space()="Update"]';
    protected readonly donationStatusEL: string ='//div[contains(text(),"Donation status")]/following-sibling::div//mat-select';
    protected readonly donationPaidOnEL: string ='//div[contains(text(),"Donation paid on")]/following-sibling::div//mat-datepicker-toggle';
    protected readonly donationPaymentMethodEL: string ='//div[contains(text(),"Payment method")]/following-sibling::div//mat-select';
    protected readonly donationPaidToEL: string ='//div[contains(text(),"Donation paid to")]/following-sibling::div//mat-select';
    protected readonly payUPINameEL: string ='//div[contains(text(),"UPI name")]/following-sibling::div//mat-select';
    protected readonly fileUploadEL: string ='//*[contains(text(),"Upload document")]/following-sibling::*//label';
    protected readonly donationConfirmBtnEl: string ='//span[normalize-space()="Confirm"]';

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.page = page;
        // this.myDonationEl = page.locator();
        // this.guestDonationEl = page.locator();
        // this.memberDonationEl = page.locator();
        // this.addGuestDonationBtnEl = page.locator();
        // this.guestFullNameEl = page.locator();
        // this.guestEmailEl = page.locator();
        // this.guestPhoneNumberEl = page.locator();


        // this.donationTypeEl = page.locator();
        // this.donationAmountEL = page.locator();
        // this.donationEventNoEl = page.locator();
        // this.donationCreateBtnEl = page.locator();
        // this.donationUpdateBtnEl = page.locator();
        // this.donationConfirmBtnEl = page.locator();

        // this.firstExpansionPanelEl=page.locator();
        // this.donationNumber1stRowEL = page.locator();

        // this.advSearchBtnEl = page.locator();
        // this.searchFldEl = page.locator();
        // this.advSearchSearchBtnEl = page.locator();
        // this.advSearchCloseBtnEl = page.locator();
        // this.donationNumberSearchEl = page.locator()
        // this.donorNameSearchEl = page.locator()

        // this.donationStatusEL = page.locator();
        // this.donationPaidOnEL = page.locator();
        // this.donationPaymentMethodEL = page.locator();
        // this.donationPaidToEL = page.locator();
        // this.payUPINameEL = page.locator();
        // this.fileUploadEL = page.locator();

    }

    async addGuestDonation(data: {
        name: string,
        email: string,
        phoneNo: string,
        amount: number
    }) {
        await this.gotoTab('guest');
        await this.page.click(this.addGuestDonationBtnEl);
        await this.page.fill(this.guestFullNameEl, data.name);
        await this.page.fill(this.guestEmailEl, data.email);
        await this.page.fill(this.guestPhoneNumberEl, data.phoneNo);
        await this.select(this.donationTypeEl, 'One Time');
        await this.page.fill(this.donationAmountEL, data.amount + '');
        await this.page.click(this.donationEventNoEl);
        await this.page.click(this.donationCreateBtnEl);
        await expect.soft(this.page.locator(this.alertEL)).toContainText(AppAlert.donation_created.message)

        await this.page.click(this.firstExpansionPanelEl);
        let donationNumber=await this.getLocator(this.donationNumber1stRowEL).textContent()
        await this.page.click(this.firstExpansionPanelEl);
        return donationNumber;
    }


    async search(search?: string, advancedSearch?: { 
        donationId?: string; 
        donorName?: string;
        close?: boolean 
    }) {
        if (search) {
            await this.page.click(this.searchFldEl);
            await this.keyboardType(search);
        } else if (advancedSearch) {
            if (advancedSearch.close) {
                await this.page.click(this.advSearchCloseBtnEl);
            } else {
                await this.page.click(this.advSearchBtnEl);
                if (advancedSearch.donationId) {
                    await this.page.fill(this.donationNumberSearchEl, advancedSearch.donationId);
                }
                if (advancedSearch.donorName) {
                    await this.page.fill(this.donorNameSearchEl, advancedSearch.donorName);
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
        donorInfo?:{
            email?: string;
            name?: string;
            phoneNo?: string;
        };
       status?:string;
    }) {
        await this.page.click(this.firstExpansionPanelEl)
        await this.page.click(this.donationUpdateBtnEl)
        if(data.amount){
            await this.page.fill(this.donationAmountEL,data.amount)
        }
        if(data.status){
            await this.select(this.donationStatusEL,data.status)
        }

        if(data.status?.toLowerCase() == 'paid'){

            //TODO
            await this.selectdate(this.donationPaidOnEL,{
                year:data.paidOn?.getFullYear()+'',
                month: 'JAN',
                date:data.paidOn?.getDate()+''
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

        await this.page.click(this.donationConfirmBtnEl)
        await expect.soft(this.page.locator(this.alertEL)).toContainText(AppAlert.donation_updated.message)
    }
   

    async gotoTab(tab:'guest'|'self'|'member') {
        if(tab =='guest'){
            await this.page.click(this.guestDonationEl)
        }
    }

    async checkDonationStatus(status:string) {
        await this.page.click(this.firstExpansionPanelEl)
        let text = await this.getLocator('(//div[contains(text(),"Donation status")]/following-sibling::div)[1]').textContent();
        expect.soft(text!.trim()).toBe(status.trim());
    }

}