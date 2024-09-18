import { expect, Locator, Page, TestInfo } from "@playwright/test";

export class BasePage {
    protected page: Page;
    protected readonly testInfo: TestInfo;
    protected readonly pageTitleEL: Locator;
    protected readonly navbarProfileIconEl: Locator;
    protected readonly navbarLogoutBtnEl: Locator;
    protected readonly popupYesButtonEl: Locator;
    protected readonly alertEL: Locator;
    protected readonly navbarMyProfileBtnEl: Locator;
    protected readonly logoIconEl: Locator;
    

    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
        //console.log(testInfo)
        this.pageTitleEL = page.locator('//app-page-title//span');
        this.navbarProfileIconEl=page.locator('//img[@alt="Profile"]')
        this.navbarLogoutBtnEl=page.locator('//a[normalize-space(text())="Logout"]')
        this.navbarMyProfileBtnEl=page.locator('//a[normalize-space(text())="My profile"]')
        this.popupYesButtonEl=page.locator('//button[normalize-space(text())="Yes"]');
        this.alertEL=page.locator('//div[@id="alert"]')
        this.logoIconEl=page.locator('//img[@src="/assets/logo.png"]');
    }

    protected async captureScreenshot(name?: string) {
        const screenshot = await this.page.screenshot();
        //console.log(name)
        await this.testInfo.attach(name ? name : 'screenshot', { body: screenshot, contentType: 'image/png' })
    }

    protected async click(locator: Locator) {
        console.log(`Clicking on element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        await locator.click();
        //await this.captureScreenshot(`Clicked on locator ${locator}`);
    }

    protected async enter(locator: Locator, value: string) {
        console.log(`Entering '${value}' on element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        await locator.fill(value);
       // await this.captureScreenshot(`Entered '${value}' on locator ${locator}`);
    }

    protected async select(locator: Locator, value: string) {
        console.log(`Selecting '${value}' on element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        await locator.click();
        let mat_option=this.page.locator(`mat-option:has-text("${value}")`);
       // await mat_option.waitFor({state:'hidden',timeout:2000})
        let options=await mat_option.all();
        if(options.length > 0){
            await options.at(0)!.click();
        }else{
            throw new Error(`No option found with ${value}`)
        }
        //await this.captureScreenshot(`Selected '${value}' on locator ${locator}`);
    }

    protected async selectdate(locator: Locator, value: {year:string;month:string;date:string}) {
        console.log(`Selecting date '${value}' on element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        await locator.click();
        await this.page.locator('//button[@aria-label="Choose month and year"]').click();
        await this.page.locator('//mat-calendar').getByText(value.year).click();
        await this.page.locator('//mat-calendar').getByText(value.month).click()
        await this.page.locator('//mat-calendar').getByText(value.date).click()
    }

    protected async uploadFile(locator: Locator, str: string) {
        console.log(`Uploading file ${str} on element ${locator}`)
        const fileChooserPromise = this.page.waitForEvent('filechooser',{timeout:5000});
        await locator.click();
        const fileChooser=await fileChooserPromise;
        await fileChooser.setFiles(str,{timeout:2000})
    }

    protected async getTextOrValue(locator: Locator) {
        console.log(`Fetching innertext/value element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        return await locator.textContent();
    }

    protected async assertText(locator:Locator,text:string,option?:{isHard?:boolean}){
        console.log(`Asserting text '${text}' on element ${locator}`)
        if(option?.isHard){
            await expect(locator).toContainText(text);
        }else{
            await expect.soft(locator).toContainText(text,{ignoreCase:true});
        }
    }

    protected async clear(locator: Locator) {
        console.log(`Clearing element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        await locator.clear();
    }

    protected async keyboardType(search: string) {
        console.log(`Typing ${search} to focused element.`)
        await this.page.keyboard.type(search);
    }

    protected getLocator(locator:string){
        return this.page.locator(locator);
    }

    protected request(){
        return this.page.request;
    }

    async logout() {
        await this.click(this.navbarProfileIconEl)
        await this.click(this.navbarLogoutBtnEl)
        await this.click(this.popupYesButtonEl)
        await expect.soft(this.page.locator('//app-login//div[@role="alert"]')).toContainText("You must be logged in to access digital portal of Nabarun")
        return new (await import('./login')).LoginPage(this.page,this.testInfo);
    }

    async backToDashboard() {
        for(const elem of await this.logoIconEl.all()){
            if(await elem.isVisible()){
                await this.click(elem);
                break;
            }
        }
        return new (await import('./dashboard')).DashboardPage(this.page,this.testInfo);
    }
}