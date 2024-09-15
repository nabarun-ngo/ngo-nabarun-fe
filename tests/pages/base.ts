import { expect, Locator, Page, TestInfo } from "@playwright/test";

export class BasePage {
    page: Page;
    pageTitleEL: Locator;
    testInfo: TestInfo;

    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
        //console.log(testInfo)
        this.pageTitleEL = page.locator('//app-page-title//span');
    }

    async captureScreenshot(name?: string) {
        const screenshot = await this.page.screenshot();
        //console.log(name)
        await this.testInfo.attach(name ? name : 'screenshot', { body: screenshot, contentType: 'image/png' })
    }

    async click(locator: Locator) {
        await locator.scrollIntoViewIfNeeded();
        await locator.click();
        //await this.captureScreenshot(`Clicked on locator ${locator}`);
    }

    async enter(locator: Locator, value: string) {
        await locator.scrollIntoViewIfNeeded();
        await locator.fill(value);
       // await this.captureScreenshot(`Entered '${value}' on locator ${locator}`);
    }

    async select(locator: Locator, value: string) {
        await locator.scrollIntoViewIfNeeded();
        await locator.click();
        await this.page.locator(`mat-option:has-text("${value}")`).click();
        //await this.captureScreenshot(`Selected '${value}' on locator ${locator}`);
    }

    async getTextOrValue(locator: Locator) {
        await locator.scrollIntoViewIfNeeded();
        return await locator.textContent();
    }

    async assertText(locator:Locator,text:string,option?:{isHard?:boolean}){
        if(option?.isHard){
            await expect(this.pageTitleEL).toContainText(text);
        }else{
            await expect.soft(this.pageTitleEL).toContainText(text);
        }
    }

    async clear(locator: Locator) {
        await locator.scrollIntoViewIfNeeded();
        await locator.clear();
    }
}