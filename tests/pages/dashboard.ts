import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { DonationPage } from "./donations";
import { BasePage } from "./base";
import { WorkListPage } from "./workList";
import { LoginPage } from "./login";
import { ProfilePage } from "./profile";
import { constant } from "tests/data/constant";
import { logStep } from 'allure-js-commons';

export class DashboardPage extends BasePage {
    
   
    protected readonly donationTileEl: string ='#donationTile';
    protected readonly membersTileEl: string= '#memberTile';
    protected readonly accountTileEl: string='#accountTile';
    protected readonly requestTileEl: string='#requestTile';
    protected readonly worklistTileEl: string='#worklistTile';
    protected readonly noticeTileEl: string='#noticeTile';
    

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        // this.donationTileEl = page.locator();
        // this.membersTileEl = page.locator();
        // this.accountTileEl = page.locator();
        // this.requestTileEl = page.locator();
        // this.worklistTileEl = page.locator();
        // this.noticeTileEl = page.locator();
        
    }

    async checkDashboardTitle() {
       // await this.assertText(this.pageTitleEL,"WELCOME TO NABARUN'S SECURED DASHBOARD");
       expect.soft(this.getLocator(this.pageTitleEL)).toContainText("WELCOME TO NABARUN'S SECURED DASHBOARD")
    }

    async gotoDonations() {
        await logStep('Goto Donations')
        //await this.page.waitForNavigation();
        await this.page.click(this.donationTileEl);
        //await this.page.click(this.donationTileEl);
        // await this.assertText(this.pageTitleEL,);
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("DONATION DASHBOARD")
        return new DonationPage(this.page, this.testInfo);
    }

    async gotoMembers() {
        await logStep('Goto Members')
        await this.page.click(this.membersTileEl);
        //await this.assertText(this.pageTitleEL,"MEMBERS");
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("MEMBERS")

    }

    async gotoAccounts() {
        await logStep('Goto Accounts')
        await this.page.click(this.accountTileEl);
        //await this.assertText(this.pageTitleEL,"Accounts");
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("Accounts")

    }

    async gotoRequests() {
        await logStep('Goto Requests')
        await this.page.click(this.requestTileEl);
        //await this.assertText(this.pageTitleEL,"Requests");
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("Requests")

    }

    async gotoWorkList() {
        await logStep('Goto WorkList')
        await this.page.click(this.worklistTileEl);
        //await this.assertText(this.pageTitleEL,"");
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("My Worklist")
        return new WorkListPage(this.page, this.testInfo);
    }

    async gotoNotices() {
        await logStep('Goto Notices')
        await this.page.click(this.noticeTileEl);
        //await this.assertText(this.pageTitleEL,"NOTICES");
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("NOTICES")
    }

  

    async gotoMyProfile() {
        await logStep('Goto My Profile')
        await this.page.click(this.navbarProfileIconEl)
        await this.page.click(this.navbarMyProfileBtnEl)
        //await this.assertText(this.pageTitleEL,"MY PROFILE");
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        expect.soft(this.getLocator(this.pageTitleEL)).toContainText("MY PROFILE")
        return new ProfilePage(this.page,this.testInfo);
    }
   
}