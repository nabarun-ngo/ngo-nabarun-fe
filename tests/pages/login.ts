import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { DashboardPage } from "./dashboard";
import { BasePage } from "./base";

export class LoginPage extends BasePage{
    protected readonly loginWithPasswordEl: Locator;
    protected readonly loginWithEmailEl: Locator;
    protected readonly usernameEl: Locator;
    protected readonly continueBtnEl: Locator;
    protected readonly passwordEl: Locator;
    protected readonly submitBtnEl: Locator;
    protected readonly loginAcceptEL: Locator;
    constructor(page:Page,testInfo:TestInfo){
        super(page,testInfo);
        this.loginWithPasswordEl=page.getByText('Continue with Password');
        this.loginWithEmailEl=page.getByText('Continue with Email');
        this.usernameEl=page.locator('#username');
        this.continueBtnEl=page.locator('//button[contains(text(),"Continue")]');
        this.passwordEl=page.locator('#password');
        this.submitBtnEl=page.locator('//button[contains(text(),"Login")]');
        this.loginAcceptEL=page.locator('//*[@value="accept"]');
    }

    async continueWithPassword(){
        await this.loginWithPasswordEl.click() 
    }

    async continueWithEmail(){

    }

    async login(data:{username:string,password:string}){
        await this.usernameEl.fill(data.username);
        await this.continueBtnEl.click();
        await this.passwordEl.fill(data.password);
        await this.submitBtnEl.click();
        await this.loginAcceptEL.waitFor({state:'visible',timeout:1000}).catch(e=>{})
        const isVisible=await this.loginAcceptEL.isVisible();
        //console.log(isVisible)
        if(isVisible){
            await this.loginAcceptEL.click();
        }
        await expect.soft(this.pageTitleEL).toContainText("WELCOME TO NABARUN'S SECURED DASHBOARD",{timeout:60000});
        return new DashboardPage(this.page,this.testInfo);
    }
}