import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";
import { constant } from "tests/data/constant";


export class WorkListPage extends BasePage {
    private readonly pendingWorksTabEl: string = "//span[contains(text(),'Pending Works')]";
    private readonly completedWorksTabEl: string = "//span[contains(text(),'Completed Works')]";
    private readonly remarksFldEl: string = '//div[contains(text(),"Remarks")]/following-sibling::div//textarea';
    private readonly decisionFldEl: string = '//div[contains(text(),"Decision")]/following-sibling::div//mat-select';
    private readonly searchFldEl: string = "#simple-search";
    private readonly firstExpansionPanelEl: string = '(//span[contains(@class,"mat-expansion-indicator")])[1]';
    private readonly cancelBtnEl: string = "(//span[contains(text(),'Cancel')]/parent::button)[1]";
    private readonly updateBtnEl: string = "(//span[contains(text(),'Update')]/parent::button)[1]";
    private readonly confirmBtnEl: string = "(//span[contains(text(),'Confirm')]/parent::button)[1]";
    private readonly advSearchBtnEl: string = "//button[contains(text(),'Advanced Search')]";
    private readonly advSearchRequestIdEl: string = "#requestId";
    private readonly advSearchWorkIdEl: string = "#workId";
    private readonly advSearchSearchBtnEl: string = "//button[normalize-space(text())='Search']";
    private readonly advSearchCloseBtnEl: string = "//button[normalize-space(text())='Close']";

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.page = page;
        // this.pendingWorksTabEl=page.locator();
        // this.completedWorksTabEl=page.locator();
        // this.searchFldEl=page.locator();
        // this.firstExpansionPanelEl=page.locator();
        // this.decisionFldEl=page.locator();
        // this.remarksFldEl=page.locator();
        // this.cancelBtnEl=page.locator();
        // this.updateBtnEl=page.locator();
        // this.confirmBtnEl=page.locator();
        // this.advSearchBtnEl=page.locator();
        // this.advSearchRequestIdEl=page.locator();
        // this.advSearchWorkIdEl=page.locator();
        // this.advSearchSearchBtnEl=page.locator();
        // this.advSearchCloseBtnEl=page.locator();


    }

    async search(search?: string, advancedSearch?: { workId?: string; requestId?: string; close?: boolean }) {
        if (search) {
            await this.page.click(this.searchFldEl);
            await this.page.keyboard.type(search);
        } else if (advancedSearch) {
            if (advancedSearch.close) {
                await this.page.click(this.advSearchCloseBtnEl);
            } else {
                await this.page.click(this.advSearchBtnEl);
                if (advancedSearch.workId) {
                    await this.page.fill(this.advSearchWorkIdEl, advancedSearch.workId);
                }
                if (advancedSearch.requestId) {
                    await this.page.fill(this.advSearchRequestIdEl, advancedSearch.requestId);
                }
                await this.page.click(this.advSearchSearchBtnEl);
            }

        }


    }

    async confirmDecisionTask(data: { id: string, decision: string, remarks: string }) {
        await this.page.click(this.pendingWorksTabEl)
        await this.search(undefined, { requestId: data.id })
        await this.page.click('(//span[contains(@class,"mat-expansion-indicator")])[1]');
        await this.page.click(this.updateBtnEl)
        await this.select(this.decisionFldEl, data.decision);
        await this.page.fill(this.remarksFldEl, data.remarks)
        await this.page.click(this.confirmBtnEl)
        await this.search(undefined, { close: true })
        await this.page.click(this.completedWorksTabEl)
        await this.search(undefined, { requestId: data.id })
        await expect.soft(this.getLocator(this.firstExpansionPanelEl)).toBeVisible();
    }

    async checkIfTaskExists(requestType: string, reverse?: boolean) {
        await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        console.log("isReverse: "+reverse+" ReqType="+requestType)
        console.log("Loading completes")
        let items = await this.getLocator('//mat-expansion-panel').all();
        console.log("List of Elements "+items)

        for (let i = 0; i < items.length; i++) {
            await items[i].click();
            console.log("Click Element "+i)
            await this.page.waitForSelector(this.loadingEl,{state:'hidden',timeout:constant.pageLoadTimeout})
        }
        let locator = await this.page.locator('//div[contains(text(),"Request Type")]/following-sibling::div').allInnerTexts();
        console.log("List of locators "+locator)

        if (reverse) {
            expect.soft(locator).not.toContain(requestType)
        } else {
            expect.soft(locator).toContain(requestType)
        }
        this.captureScreenshot('checkIfTaskExists')
    }


}