import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";
import { StringColorFormat } from "@faker-js/faker";

export class DonationPage extends BasePage{
    
    page: Page;
    myDonationEl: Locator;
    guestDonationEl: Locator;
    memberDonationEl: Locator;
    addGuestDonationBtnEl: Locator;
    guestFullNameEl: Locator;
    guestEmailEl: Locator;
    guestPhoneNumberEl: Locator;
    donationAmountEL: Locator;
    donationTypeEl: Locator;
    donationEventNoEl: Locator;
    donationCreateBtnEl: Locator;
    firstRowEl: Locator;
    donationNumber1stRowEL: Locator;
  
    constructor(page:Page,testInfo:TestInfo){
        super(page,testInfo);
        this.page=page;
        this.myDonationEl=page.locator("//span[contains(text(),'My Donations')]");
        this.guestDonationEl=page.locator("//span[contains(text(),'Guest Donations')]");
        this.memberDonationEl=page.locator("//span[contains(text(),'Member Donations')]");
        this.addGuestDonationBtnEl=page.locator('//button[contains(text(),"Add Guest Donation")]');
        this.guestFullNameEl=page.locator('//input[@formcontrolname="fullName"]');
        this.guestEmailEl=page.locator('//input[@formcontrolname="email"]');
        this.guestPhoneNumberEl=page.locator('//input[@formcontrolname="primaryNumber"]');

        
        this.donationTypeEl=page.locator('//div[contains(text(),"Donation type")]/following-sibling::div//mat-select');
        this.donationAmountEL=page.locator('//div[contains(text(),"Donation amount")]/following-sibling::div//input');
        this.donationEventNoEl=page.locator('//label[@for="no"]');
        this.donationCreateBtnEl = page.locator('//span[normalize-space()="Create"]');
        this.firstRowEl=page.locator('(//mat-panel-description//span)[1]');
        this.donationNumber1stRowEL=page.locator('(//div[contains(text(),"Donation number")]/following-sibling::div)[1]');
    }

    async addGuestDonation(data:{
        name: string,
        email:string,
        phoneNo:string,
        amount:number
    }){
        await this.click(this.guestDonationEl)
        await this.click(this.addGuestDonationBtnEl);
        await this.enter(this.guestFullNameEl,data.name);
        await this.enter(this.guestEmailEl,data.email);
        await this.enter(this.guestPhoneNumberEl,data.phoneNo);
        await this.select(this.donationTypeEl,'One Time');
        await this.enter(this.donationAmountEL,data.amount+'');
        await this.click(this.donationEventNoEl);
        await this.click(this.donationCreateBtnEl);
        await expect.soft(this.firstRowEl).toContainText(data.name,{timeout:30000});
        await this.click(this.firstRowEl);
        return await this.getTextOrValue(this.donationNumber1stRowEL);
    }

    updateDonation(data: { 
        id: string; amount?: number; email?: string; name: string; phoneNo: string; }) {
        throw new Error("Method not implemented.");
    }
    
}