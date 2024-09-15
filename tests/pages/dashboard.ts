import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { DonationPage } from "./donations";
import { BasePage } from "./base";
import { WorkListPage } from "./workList";
import { LoginPage } from "./login";

export class DashboardPage extends BasePage {
   
    page: Page;
    donationTileEl: Locator;
    membersTileEl: Locator;
    accountTileEl: Locator;
    requestTileEl: Locator;
    worklistTileEl: Locator;
    noticeTileEl: Locator;
    profileIconEl: Locator;
    logoutBtnEl: Locator;
    yesButtonEl: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.page = page;
        this.donationTileEl = page.locator('#donationTile');
        this.membersTileEl = page.locator('#memberTile');
        this.accountTileEl = page.locator('#accountTile');
        this.requestTileEl = page.locator('#requestTile');
        this.worklistTileEl = page.locator('#worklistTile');
        this.noticeTileEl = page.locator('#noticeTile');
        this.profileIconEl=page.locator('//img[@alt="Profile"]')
        this.logoutBtnEl=page.locator('//a[text()="Logout"]')
        this.yesButtonEl=page.locator('//button[normalize-space(text())="Yes"]');
    }

    async gotoDonations() {
        await this.click(this.donationTileEl);
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

    async logout() {
        await this.click(this.profileIconEl)
        await this.click(this.logoutBtnEl)
        await this.click(this.yesButtonEl)
        expect.soft(this.page.locator('//div[@role="alert"]')).toContainText("You must be logged in to access digital portal of Nabarun")
        return new LoginPage(this.page,this.testInfo);
    }
}