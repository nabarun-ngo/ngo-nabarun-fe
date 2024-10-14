import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { attachment } from 'allure-js-commons';

export class BasePage {
    protected page: Page;
    protected readonly testInfo: TestInfo;
    protected readonly pageTitleEL: string = '//app-page-title//span';
    protected readonly navbarProfileIconEl: string='//img[@alt="Profile"]';
    protected readonly navbarLogoutBtnEl: string='//a[normalize-space(text())="Logout"]';
    protected readonly popupYesButtonEl: string='//button[normalize-space(text())="Yes"]';
    protected readonly alertEL: string='//div[@id="alert"]';
    protected readonly navbarMyProfileBtnEl: string='//a[normalize-space(text())="My profile"]';
    protected readonly logoIconEl: string='//img[@src="/assets/logo.png"]';
    protected readonly loadingEl: string="//*[contains(text(),'Please wait, Things are getting ready...')]";


    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
        //console.log(testInfo)
        // this.pageTitleEL = page.locator();
        // this.navbarProfileIconEl=page.locator()
        // this.navbarLogoutBtnEl=page.locator()
        // this.navbarMyProfileBtnEl=page.locator()
        // this.popupYesButtonEl=page.locator();
        // this.alertEL=page.locator()
        // this.logoIconEl=page.locator();
    }

    protected async captureScreenshot(name?: string) {
        const screenshot = await this.page.screenshot();
        //console.log(name)
        await attachment(name ? name : 'screenshot',screenshot,{contentType: 'image/png'});
        //await this.testInfo.attach(name ? name : 'screenshot', { body: screenshot, contentType: 'image/png' })
    }

    // protected async click(locator: Locator) {
    //     console.log(`Clicking on element ${locator}`)
    //     await locator.scrollIntoViewIfNeeded();
    //     await locator.waitFor({state:'attached',timeout:2000})
    //     await locator.click();
    //     //await this.captureScreenshot(`Clicked on locator ${locator}`);
    // }

    // protected async enter(locator: Locator, value: string) {
    //     console.log(`Entering '${value}' on element ${locator}`)
    //     await locator.waitFor({state:'attached',timeout:2000})
    //     await locator.scrollIntoViewIfNeeded();
    //     await locator.fill(value);
    //    // await this.captureScreenshot(`Entered '${value}' on locator ${locator}`);
    // }

    protected async select(locator: string, value: string) {
       // console.log(`Selecting '${value}' on element ${locator}`)
        // await locator.waitFor({state:'attached',timeout:2000})
        // await locator.scrollIntoViewIfNeeded();
        await this.page.click(locator);
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

    protected async selectdate(locator: string, value: {year:string;month:string;date:string}) {
       
        //console.log(`Selecting date '${value}' on element ${locator}`)
        // await locator.waitFor({state:'attached',timeout:2000})
        // await locator.scrollIntoViewIfNeeded();
        await this.page.click(locator);
        //mat-datepicker-toggle
        await this.page.click('//button[@aria-label="Choose month and year"]');
        await this.handleCalendarAndSelectDate(value)
        
    }

    private async handleCalendarAndSelectDate(value: {year:string;month:string;date:string}){
        let list=await this.page.locator('.mat-calendar-body-cell-content').allInnerTexts();
        let firstYear:number= parseInt(list[0])
        let year:number= parseInt(value.year)
        if(list.includes(value.year)){
            await this.page.locator('//mat-calendar').getByText(value.year).click();
            await this.page.locator('//mat-calendar').getByText(value.month).click()
            await this.page.locator('//mat-calendar').getByText(value.date).click()
        }else if(firstYear > year){
            //click left
            await this.page.click('.mat-calendar-previous-button')
            await this.handleCalendarAndSelectDate(value)
        }else if(firstYear < year){
            //click right
            await this.page.click('.mat-calendar-next-button')
            await this.handleCalendarAndSelectDate(value)
        }
    }

    protected async uploadFile(locator: string, str: string) {
        //console.log(`Uploading file ${str} on element ${locator}`)
        const fileChooserPromise = this.page.waitForEvent('filechooser',{timeout:5000});
        await this.page.click(locator);
        const fileChooser=await fileChooserPromise;
        await fileChooser.setFiles(str,{timeout:2000})
    }

    // protected async getTextOrValue(locator: Locator) {
    //     console.log(`Fetching innertext/value element ${locator}`)
    //     await locator.scrollIntoViewIfNeeded();
    //     await locator.waitFor({state:'attached',timeout:2000})
    //     return await locator.textContent();
    // }

    // protected async assertText(locator:Locator,text:string,option?:{isHard?:boolean}){
    //     console.log(`Asserting text '${text}' on element ${locator}`)
    //     if(option?.isHard){
    //         await expect(locator).toContainText(text);
    //     }else{
    //         await expect.soft(locator).toContainText(text,{ignoreCase:true});
    //     }
    // }

    protected async clear(locator: Locator) {
      //  console.log(`Clearing element ${locator}`)
        await locator.waitFor({state:'attached',timeout:2000})
        await locator.scrollIntoViewIfNeeded();
        await locator.clear();
    }

    protected async keyboardType(search: string) {
        //console.log(`Typing ${search} to focused element.`)
        await this.page.keyboard.type(search);
    }

    protected getLocator(locator:string){
        return this.page.locator(locator);
    }

    protected request(){
        return this.page.request;
    }

    async logout() {
        await this.page.click(this.navbarProfileIconEl)
        await this.page.click(this.navbarLogoutBtnEl)
        await this.page.click(this.popupYesButtonEl)
        await expect.soft(this.page.locator('app-login p.font-semibold')).toContainText("Welcome to Nabarun")
        return new (await import('./login')).LoginPage(this.page,this.testInfo);
    }

    async backToDashboard() {
        for(const elem of await this.page.locator(this.logoIconEl).all()){
            if(await elem.isVisible()){
                await elem.click();
                break;
            }
        }
        return new (await import('./dashboard')).DashboardPage(this.page,this.testInfo);
    }
}