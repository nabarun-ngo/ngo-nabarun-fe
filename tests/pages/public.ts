import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";

export class NabarunPublicPage extends BasePage{
    protected firstnameEl: Locator;
    joinUsLinkEl: Locator;
    joinNowBtnEl: Locator;
    whyDoUWantToJoinEl: Locator;
    howDoUKnowAboutEl: Locator;
    whereAreYouFromEl: Locator;
    mobileNumberEl: Locator;
    phoneCodeEl: Locator;
    emailEl: Locator;
    lastNameEl: Locator;
    page: Page;
    breadCrumbEL: Locator;
    agreeAndContinueBtnEl: Locator;
    loginEmailEl: Locator;
    loginPasswordEl: Locator;
    loginPasswordConfirmEl: Locator;
    proceedBtnEl: Locator;
    oneTimePasswordEl: Locator;
    submitBtnEl: Locator;
    loginEmailValue: string | null;
    baseURL: string;
    alertEl: Locator;

    constructor(page:Page,testInfo:TestInfo){
        super(page,testInfo);
        this.baseURL = process.env.BASE_URL!;
        this.page = page;
        /**
         * Elements for 'Join us'
         */
        this.joinUsLinkEl = page.locator('//a[text()="Join Us"]');
        this.firstnameEl = page.locator('//*[@id="firstname"]');
        this.lastNameEl = page.locator('//*[@id="lastname"]');
        this.emailEl = page.locator("//form[@id='JoinUsForm']//input[@id='email']");
        this.phoneCodeEl = page.locator("//form[@id='JoinUsForm']//select[@id='phonecode']");
        this.mobileNumberEl = page.locator("//form[@id='JoinUsForm']//input[@id='mobileno']");
        this.whereAreYouFromEl = page.locator('//*[@id="location"]');
        this.howDoUKnowAboutEl = page.locator('//*[@id="howDoUKnow"]');
        this.whyDoUWantToJoinEl = page.locator('//*[@id="whyDoUWantToJoin"]');
        this.joinNowBtnEl = page.locator('//*[@id="joinNow"]');

        this.breadCrumbEL = page.getByRole('list');
        this.agreeAndContinueBtnEl = page.getByRole('button', { name: 'Agree and Continue' });
        this.loginEmailEl = page.getByPlaceholder('Login Email', { exact: true });
        this.loginPasswordEl = page.locator('//*[@id="password"]')
        this.loginPasswordConfirmEl = page.locator('//*[@id="confirmpassword"]');
        this.proceedBtnEl = page.getByRole('button', { name: 'Proceed' });
        this.oneTimePasswordEl = page.locator('//input[@id="otp"]');
        this.submitBtnEl = page.getByRole('button', { name: 'Submit' });
        this.alertEl = page.getByRole('alert');
    }


    async clickJoinUs() {
        await this.joinUsLinkEl.click();
    }

    async fillJoiningForm(data: {
        firstName: string,
        lastName: string,
        email: string,
        phoneCode: string,
        phoneNumber: string,
        whereAreYouFrom: string,
        howDoYouKnowAboutNabarun: string,
        whyDoYouWantToJoinNabarun: string,
    }) {
        await this.firstnameEl.fill(data?.firstName);
        await this.lastNameEl.fill(data?.lastName);
        await this.emailEl.fill(data?.email);
        await this.phoneCodeEl.selectOption(data?.phoneCode);
        await this.mobileNumberEl.fill(data?.phoneNumber);
        await this.whereAreYouFromEl.fill(data?.whereAreYouFrom);
        await this.howDoUKnowAboutEl.fill(data?.howDoYouKnowAboutNabarun);
        await this.whyDoUWantToJoinEl.fill(data?.whyDoYouWantToJoinNabarun);
        await this.joinNowBtnEl.click();
        await expect.soft(this.breadCrumbEL).toContainText('Rules and Regulations');
        await this.page.screenshot({type:'png',fullPage:true,path:'/my-report/screenshots/'+new Date().toDateString()+'.png'})
    }

    async agreeAndContinue() {
        await this.agreeAndContinueBtnEl.click();
        await expect.soft(this.breadCrumbEL).toContainText('Login Details');
        await this.page.screenshot({type:'png',fullPage:true,path:'/my-report/screenshots/'+new Date().toDateString()+'.png'})
    }

    async fillLoginDetail(data: { password: string }) {
       // await this.page.mouse.move(0,300);
        this.loginEmailValue = await this.loginEmailEl.getAttribute('value');
        await this.loginPasswordEl.scrollIntoViewIfNeeded();
        await this.loginPasswordEl.fill(data.password);
        await this.loginPasswordConfirmEl.fill(data.password);
        await this.proceedBtnEl.click();
        await expect.soft(this.breadCrumbEL).toContainText('Verify and Submit');
        await this.page.screenshot({type:'png',fullPage:true,path:'/my-report/screenshots/'+new Date().toDateString()+'.png'})
    }

    async submit() {
        let response = await this.page.request.get(this.baseURL + '/test/getLatestTestOtp', { params: { email: this.loginEmailValue! } })
        expect(response).toBeOK();
        let otpData= await response.json() as {responsePayload : string}
       // await this.page.mouse.move(0,300);
        await this.oneTimePasswordEl.scrollIntoViewIfNeeded();
        await this.oneTimePasswordEl.fill(otpData.responsePayload);
        await this.page.screenshot({type:'png',fullPage:true,path:'/my-report/screenshots/'+new Date().toDateString()+'.png'})
        await this.submitBtnEl.click(); 
        await expect.soft(this.breadCrumbEL).toContainText('Request Submitted');
        const reqId=await this.page.locator('//*[@id="id"]').textContent();
        await expect.soft(this.alertEl).toContainText('Thank you for your interest. Your request number is '+reqId+'. We will connect you very shortly.');
        await this.page.screenshot({type:'png',fullPage:true,path:'/my-report/screenshots/'+new Date().toDateString()+'.png'})
        return reqId;
    }
}