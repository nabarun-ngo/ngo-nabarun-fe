import { Page, TestInfo } from "playwright/test";
import { BasePage } from "./base";

export class MemberPage extends BasePage{
    constructor(page:Page,testInfo:TestInfo){
        super(page,testInfo);
        // this.loginWithPasswordEl=page.getByText('Continue with Password');
        // this.loginWithEmailEl=page.getByText('Continue with Email');
        // this.usernameEl=page.locator('#username');
        // this.continueBtnEl=page.locator('//button[contains(text(),"Continue")]');
        // this.passwordEl=page.locator('#password');
        // this.submitBtnEl=page.locator('//button[contains(text(),"Login")]');
        // this.loginAcceptEL=this.page.locator('//*[@value="accept"]');
    }
}