import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { DonationPage } from "./donations";
import { BasePage } from "./base";
import { WorkListPage } from "./workList";
import { LoginPage } from "./login";
import { ProfilePage } from "./profile";

export class DashboardPage extends BasePage {
   
    protected readonly donationTileEl: Locator;
    protected readonly membersTileEl: Locator;
    protected readonly accountTileEl: Locator;
    protected readonly requestTileEl: Locator;
    protected readonly worklistTileEl: Locator;
    protected readonly noticeTileEl: Locator;
    

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.donationTileEl = page.locator('#donationTile');
        this.membersTileEl = page.locator('#memberTile');
        this.accountTileEl = page.locator('#accountTile');
        this.requestTileEl = page.locator('#requestTile');
        this.worklistTileEl = page.locator('#worklistTile');
        this.noticeTileEl = page.locator('#noticeTile');
        
    }

    async gotoDonations() {
        //await this.page.waitForNavigation();

        await this.donationTileEl.click();

        //await this.click(this.donationTileEl);
        await this.assertText(this.pageTitleEL,"DONATION DASHBOARD");
        return new DonationPage(this.page, this.testInfo);
    }

    async gotoMembers() {
        await this.click(this.membersTileEl);
        await this.assertText(this.pageTitleEL,"MEMBERS");
    }

    async gotoAccounts() {
        await this.click(this.accountTileEl);
        await this.assertText(this.pageTitleEL,"Accounts");
    }

    async gotoRequests() {
        await this.click(this.requestTileEl);
        await this.assertText(this.pageTitleEL,"Requests");
    }

    async gotoWorkList() {
        await this.worklistTileEl.click();
        await this.assertText(this.pageTitleEL,"My Worklist");
        return new WorkListPage(this.page, this.testInfo);
    }

    async gotoNotices() {
        await this.noticeTileEl.click();
        await this.assertText(this.pageTitleEL,"NOTICES");
    }

  

    async gotoMyProfile() {
        await this.click(this.navbarProfileIconEl)
        await this.click(this.navbarMyProfileBtnEl)
        await this.assertText(this.pageTitleEL,"MY PROFILE");
        return new ProfilePage(this.page,this.testInfo);
    }
   
}