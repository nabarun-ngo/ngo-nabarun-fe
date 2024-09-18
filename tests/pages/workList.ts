import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { DashboardPage } from "./dashboard";
import { BasePage } from "./base";
import { th } from "@faker-js/faker";

export class WorkListPage extends BasePage {
    pendingWorksTabEl: Locator;
    completedWorksTabEl: Locator;
    remarksFldEl: Locator;
    decisionFldEl: Locator;
    searchFldEl: Locator;
    firstExpansionPanelEl: Locator;
    cancelBtnEl: Locator;
    updateBtnEl: Locator;
    confirmBtnEl: Locator;
    advSearchBtnEl: Locator;
    advSearchRequestIdEl: Locator;
    advSearchWorkIdEl: Locator;
    advSearchSearchBtnEl: Locator;
    advSearchCloseBtnEl: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.page = page;
        this.pendingWorksTabEl=page.locator("//span[contains(text(),'Pending Works')]");
        this.completedWorksTabEl=page.locator("//span[contains(text(),'Completed Works')]");
        this.searchFldEl=page.locator("#simple-search");
        this.firstExpansionPanelEl=page.locator('(//span[contains(@class,"mat-expansion-indicator")])[1]');
        this.decisionFldEl=page.locator('//div[contains(text(),"Decision")]/following-sibling::div//mat-select');
        this.remarksFldEl=page.locator('//div[contains(text(),"Remarks")]/following-sibling::div//textarea');
        this.cancelBtnEl=page.locator("(//span[contains(text(),'Cancel')]/parent::button)[1]");
        this.updateBtnEl=page.locator("(//span[contains(text(),'Update')]/parent::button)[1]");
        this.confirmBtnEl=page.locator("(//span[contains(text(),'Confirm')]/parent::button)[1]");
        this.advSearchBtnEl=page.locator("//button[contains(text(),'Advanced Search')]");
        this.advSearchRequestIdEl=page.locator("#requestId");
        this.advSearchWorkIdEl=page.locator("#workId");
        this.advSearchSearchBtnEl=page.locator("//button[normalize-space(text())='Search']");
        this.advSearchCloseBtnEl=page.locator("//button[normalize-space(text())='Close']");
        

    }

    async search(search?:string,advancedSearch?: { workId?: string; requestId?: string; close?:boolean}) {
        if(search){
            await this.click(this.searchFldEl);
            await this.page.keyboard.type(search);
        }else if(advancedSearch){
            if(advancedSearch.close){
                await this.click(this.advSearchCloseBtnEl);
            }else{
                await this.click(this.advSearchBtnEl);
                if(advancedSearch.workId){
                    await this.enter(this.advSearchWorkIdEl,advancedSearch.workId);
                }
                if(advancedSearch.requestId){
                    await this.enter(this.advSearchRequestIdEl,advancedSearch.requestId);
                }   
                await this.click(this.advSearchSearchBtnEl);
            }
           
        }
        
        
    }

    async confirmDecisionTask(data: { id: string, decision: string, remarks: string }) {
        await this.click(this.pendingWorksTabEl)
        await this.search(undefined,{requestId:data.id})
        await this.page.click('(//span[contains(@class,"mat-expansion-indicator")])[1]')           ;
        await this.click(this.updateBtnEl)
        await this.select(this.decisionFldEl,data.decision);
        await this.enter(this.remarksFldEl,data.remarks)
        await this.click(this.confirmBtnEl)
        await this.search(undefined,{close:true})
        await this.click(this.completedWorksTabEl)
        await this.search(undefined,{requestId:data.id})
        await expect.soft(this.firstExpansionPanelEl).toBeVisible();

    }
    

}