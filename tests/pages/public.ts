import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { BasePage } from "./base";

export class NabarunPublicPage extends BasePage {
    protected readonly firstnameEl: string='//*[@id="firstname"]';
    protected readonly joinUsLinkEl: string ='//a[text()="Join Us"]';
    protected readonly joinNowBtnEl: string='//*[@id="joinNow"]';
    protected readonly whyDoUWantToJoinEl: string='//*[@id="whyDoUWantToJoin"]';
    protected readonly howDoUKnowAboutEl: string='//*[@id="howDoUKnow"]';
    protected readonly whereAreYouFromEl: string='//*[@id="location"]';
    protected readonly mobileNumberEl: string="//form[@id='JoinUsForm']//input[@id='mobileno']";
    protected readonly phoneCodeEl: string="//form[@id='JoinUsForm']//select[@id='phonecode']";
    protected readonly emailEl: string="//form[@id='JoinUsForm']//input[@id='email']";
    protected readonly lastNameEl: string='//*[@id="lastname"]';
    protected readonly breadCrumbEL: Locator;
    protected readonly agreeAndContinueBtnEl: Locator;
    protected readonly loginEmailEl: Locator;
    protected readonly loginPasswordEl: string='//*[@id="password"]';
    protected readonly loginPasswordConfirmEl: string='//*[@id="confirmpassword"]';
    protected readonly proceedBtnEl: Locator;
    protected readonly oneTimePasswordEl: string='//input[@id="otp"]';
    protected readonly submitBtnEl: Locator;
    protected readonly alertEl: Locator;

    private loginEmailValue!: string | null;
    private baseURL: string;
    protected readonly donateNowLinkEl: string =".d-none a[href='/#donate']";
    protected readonly nameEl: string="//form[@id='donationForm']//input[@id='name']";
    protected readonly donateEmailEl: string="//form[@id='donationForm']//input[@id='email']";
    protected readonly donateMobileNumberEl: string="//form[@id='donationForm']//input[@id='mobileno']";
    protected readonly amountEl: string="//form[@id='donationForm']//input[@id='amount']";
    protected readonly donateNowBtnEl: string="//button[normalize-space()='Donate Now']";
    protected readonly donateUPICheck1El: string="#paidToAcc1";
    protected readonly donateUPISubmit1BtnEl: string="#sub_bt1";
    protected readonly donateBAEl: string="//span[normalize-space()='Bank Account']";
    protected readonly donateBACheck1El: string="#paidToAcc2";
    protected readonly donateBASubmit1BtnEl: string="#sub_bt2";
    protected readonly upiFileUploadBtnEl: string="//form[@id='donate_upi']//input[@id='file']";
    protected readonly bankFileUploadBtnEl: string="//form[@id='donate_bank']//input[@id='file']";

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.baseURL = process.env['BASE_URL']!;
        /**
         * Elements for 'Join us'
         */

        this.breadCrumbEL = page.getByRole('list');
        this.agreeAndContinueBtnEl = page.getByRole('button', { name: 'Agree and Continue' });
        this.loginEmailEl = page.getByPlaceholder('Login Email', { exact: true });
        this.proceedBtnEl = page.getByRole('button', { name: 'Proceed' });
        this.submitBtnEl = page.getByRole('button', { name: 'Submit' });
        this.alertEl = page.getByRole('alert');
         // this.joinUsLinkEl = page.locator('');
        //this.donateNowLinkEl = page.locator()
        //this.firstnameEl = page.locator();
        //this.lastNameEl = page.locator();
        //this.emailEl = page.locator();
        //this.phoneCodeEl = page.locator();
        //this.mobileNumberEl = page.locator();
        //this.whereAreYouFromEl = page.locator();
        //this.howDoUKnowAboutEl = page.locator();
        // this.whyDoUWantToJoinEl = page.locator();
        //this.joinNowBtnEl = page.locator();
        //this.oneTimePasswordEl = page.locator('');
        //this.loginPasswordEl = page.locator()
        //this.loginPasswordConfirmEl = page.locator();
        //this.nameEl = page.locator("");
        //this.donateEmailEl = page.locator();
        //this.donateMobileNumberEl = page.locator();
        //this.amountEl = page.locator();
        // this.donateNowBtnEl = page.locator()
        // this.donateUPICheck1El = page.locator()
        // this.donateUPISubmit1BtnEl = page.locator()
        // this.donateBAEl = page.locator()
        // this.donateBACheck1El = page.locator()
        // this.donateBASubmit1BtnEl = page.locator()
    }


    async clickJoinUs() {
        await this.page.click(this.joinUsLinkEl);
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
        await this.page.fill(this.firstnameEl,data?.firstName);
        await this.page.fill(this.lastNameEl,data?.lastName);
        await this.page.fill(this.emailEl,data?.email);
        await this.page.selectOption(this.phoneCodeEl,data?.phoneCode);
        await this.page.fill(this.mobileNumberEl,data?.phoneNumber);
        await this.page.fill(this.whereAreYouFromEl,data?.whereAreYouFrom);
        await this.page.fill(this.howDoUKnowAboutEl,data?.howDoYouKnowAboutNabarun);
        await this.page.fill(this.whyDoUWantToJoinEl,data?.whyDoYouWantToJoinNabarun);
        await this.page.click(this.joinNowBtnEl);
        await expect.soft(this.breadCrumbEL).toContainText('Rules and Regulations');
    }

    async agreeAndContinue() {
        await this.agreeAndContinueBtnEl.click();
        await expect.soft(this.breadCrumbEL).toContainText('Login Details');
    }

    async fillLoginDetail(data: { password: string }) {
        // await this.page.mouse.move(0,300);
        this.loginEmailValue = await this.loginEmailEl.getAttribute('value');
       // await this.page.scrollIntoViewIfNeeded();
        await this.page.fill(this.loginPasswordEl,data.password);
        await this.page.fill(this.loginPasswordConfirmEl,data.password);
        await this.proceedBtnEl.click();
        await expect.soft(this.breadCrumbEL).toContainText('Verify and Submit');
    }

    async submit() {
        let response = await this.request().get(this.baseURL + '/test/getLatestTestOtp', { params: { email: this.loginEmailValue! } })
        expect(response).toBeOK();
        let otpData = await response.json() as { responsePayload: string }
        // await this.page.mouse.move(0,300);
        await this.getLocator(this.oneTimePasswordEl).scrollIntoViewIfNeeded();
        await this.page.fill(this.oneTimePasswordEl,otpData.responsePayload);
        await this.submitBtnEl.click();
        await expect.soft(this.breadCrumbEL).toContainText('Request Submitted');
        const reqId = await this.page.textContent('//*[@id="id"]');
        await expect.soft(this.alertEl).toContainText('Thank you for your interest. Your request number is ' + reqId + '. We will connect you very shortly.');
        return reqId;
    }

    async clickDonateNow() {
        await this.page.click(this.donateNowLinkEl)
    }

    async fillDonationDetail(data: {
        amount: string;
        email: string;
        number: string;
        name: string;
    }) {
        await this.page.fill(this.nameEl, data.name)
        await this.page.fill(this.donateEmailEl, data.email)
        await this.page.fill(this.donateMobileNumberEl, data.number)
        await this.page.fill(this.amountEl, data.amount)
        await this.page.click(this.donateNowBtnEl)
    }

    async confirmPayment(method:'BA'|'UPI', file:string) {
        if(method == 'UPI'){
            await this.page.click(this.donateUPICheck1El)
            await this.uploadFile(this.upiFileUploadBtnEl,file)
            await this.page.click(this.donateUPISubmit1BtnEl)
        }else{
            await this.page.click(this.donateBAEl)
            await this.page.click(this.donateBACheck1El)
            const locator = this.page.locator("//form[@id='']//input[@id='file']");
            await this.uploadFile(this.bankFileUploadBtnEl,file)
            await this.page.click(this.donateBASubmit1BtnEl)
        }
        const reqId = await this.getLocator('//*[@id="id"]').textContent()
        await expect.soft(this.alertEl).toContainText('Your request number is '+reqId+'. We will check and confirm about this payment soonest.');
        return reqId;
    }

    requestCashPayment() {

    }
}