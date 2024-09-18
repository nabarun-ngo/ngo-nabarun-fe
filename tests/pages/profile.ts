import { Locator, Page, TestInfo } from "playwright/test";
import { BasePage } from "./base";

export class ProfilePage extends BasePage {
    protected readonly updateProfileLinkEl: Locator;
    protected readonly titleFldEl: Locator;
    protected readonly firstNameFldEl: Locator;
    protected readonly middleNameFldEl: Locator;
    protected readonly lastNameFldEl: Locator;
    protected readonly genderFldEl: Locator;
    protected readonly dateOfBirthFldEl: Locator;
    protected readonly phoneNumberPriFldEl: Locator;
    protected readonly phoneNumberSecFldEl: Locator;
    protected readonly addressCheckEL: Locator;
    protected readonly addressLine1FldEl_1: Locator;
    protected readonly addressLine1FldEl_2: Locator;
    protected readonly addressLine2FldEl_1: Locator;
    protected readonly addressLine3FldEl_1: Locator;
    protected readonly hometownFldEl_1: Locator;
    protected readonly countryFldEl_1: Locator;
    protected readonly stateFldEl_1: Locator;
    protected readonly districtFldEl_1: Locator;
    protected readonly addressLine2FldEl_2: Locator;
    protected readonly addressLine3FldEl_2: Locator;
    protected readonly hometownFldEl_2: Locator;
    protected readonly countryFldEl_2: Locator;
    protected readonly stateFldEl_2: Locator;
    protected readonly districtFldEl_2: Locator;
    protected readonly aboutFldEl: Locator;
    protected readonly facebookLinkFldEl: Locator;
    protected readonly instagramLinkFldEl: Locator;
    protected readonly linkedInLinkFldEl: Locator;
    protected readonly twitterLinkFldEl: Locator;
    protected readonly updateButtonEl: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.updateProfileLinkEl = page.getByRole('button', { name: 'Update Profile' });
        this.updateButtonEl = page.getByRole('button', { name: 'Update',exact:true });

        this.titleFldEl = page.locator('//div[contains(text(),"Title")]/following-sibling::*//mat-select')
        this.firstNameFldEl = page.locator('//div[contains(text(),"First Name")]/following-sibling::*//input')
        this.middleNameFldEl = page.locator('//div[contains(text(),"Middle Name")]/following-sibling::*//input')
        this.lastNameFldEl = page.locator('//div[contains(text(),"Last Name")]/following-sibling::*//input')
        this.genderFldEl = page.locator('//div[contains(text(),"Gender")]/following-sibling::*//mat-select')
        this.dateOfBirthFldEl = page.locator('//div[contains(text(),"Date of Birth")]/following-sibling::*//input')
        this.phoneNumberPriFldEl = page.locator('//div[contains(text(),"Phone Number (WhatsApp)")]/following-sibling::*//input')
        this.phoneNumberSecFldEl = page.locator('//div[contains(text(),"Phone Number (Alternative)")]/following-sibling::*//input')
        this.addressCheckEL = page.locator('//*[contains(text(),"Permanent Address same as Present Address")]')

        this.addressLine1FldEl_1 = page.locator('(//div[contains(text(),"Address Line 1")]/following-sibling::*//input)[1]')
        this.addressLine2FldEl_1 = page.locator('(//div[contains(text(),"Address Line 2")]/following-sibling::*//input)[1]')
        this.addressLine3FldEl_1 = page.locator('(//div[contains(text(),"Address Line 3")]/following-sibling::*//input)[1]')
        this.hometownFldEl_1 = page.locator('(//div[contains(text(),"Hometown")]/following-sibling::*//input)[1]')
        this.countryFldEl_1 = page.locator('(//div[contains(text(),"Country")]/following-sibling::*//mat-select)[1]')
        this.stateFldEl_1 = page.locator('//*[contains(text(),"Permanent Address same as Present Address")]/preceding::*//div[contains(text(),"State")]/following-sibling::*//mat-select')
        this.districtFldEl_1 = page.locator('//*[contains(text(),"Permanent Address same as Present Address")]/preceding::*//div[contains(text(),"District")]/following-sibling::*//mat-select')

        this.addressLine1FldEl_2 = page.locator('(//div[contains(text(),"Address Line 1")]/following-sibling::*//input)[2]')
        this.addressLine2FldEl_2 = page.locator('(//div[contains(text(),"Address Line 2")]/following-sibling::*//input)[2]')
        this.addressLine3FldEl_2 = page.locator('(//div[contains(text(),"Address Line 3")]/following-sibling::*//input)[2]')
        this.hometownFldEl_2 = page.locator('(//div[contains(text(),"Hometown")]/following-sibling::*//input)[2]')
        this.countryFldEl_2 = page.locator('(//div[contains(text(),"Country")]/following-sibling::*//mat-select)[2]')
        this.stateFldEl_2 = page.locator('//*[contains(text(),"Permanent Address same as Present Address")]/following::*//div[contains(text(),"State")]/following-sibling::*//mat-select')
        this.districtFldEl_2 = page.locator('//*[contains(text(),"Permanent Address same as Present Address")]/following::*//div[contains(text(),"District")]/following-sibling::*//mat-select')
        this.aboutFldEl = page.locator('//*[contains(text(),"Descrive something about you")]/following-sibling::*//textarea')
        this.facebookLinkFldEl = page.locator('//*[contains(text(),"Facebook Link")]/following-sibling::*//input')
        this.instagramLinkFldEl = page.locator('//*[contains(text(),"Instagram Link")]/following-sibling::*//input')
        this.linkedInLinkFldEl = page.locator('//*[contains(text(),"LinkedIn Link")]/following-sibling::*//input')
        this.twitterLinkFldEl = page.locator('//*[contains(text(),"Twitter Link")]/following-sibling::*//input')
        
    }

    async updateMyProfile(data: {
        about: string;
        title?: string;
        middleName?: string;
        firstName?: string;
        lastName?: string;
        gender?: string;
        dob?: string;
        phoneNo1?: string;
        phoneNo2?: string;
        address1: {
            addressLine1: string;
            addressLine2: string;
            addressLine3: string;
            hometown: string;
            district?: string;
            state?: string;
            country: string;
        };
        address2?: {
            addressLine1: string;
            addressLine2: string;
            addressLine3: string;
            hometown: string;
            district?: string;
            state?: string;
            country: string;
        };
    }) {
        this.click(this.updateProfileLinkEl)
        if (data.title) {
            await this.select(this.titleFldEl, data.title)
        }
        if (data.firstName) {
            await this.enter(this.firstNameFldEl, data.firstName)
        }
        if (data.middleName) {
            await this.enter(this.middleNameFldEl, data.middleName)
        }
        if (data.lastName) {
            await this.enter(this.lastNameFldEl, data.lastName)
        }
        if (data.gender) {
            await this.select(this.genderFldEl, data.gender)
        }
        if (data.dob) {
            await this.dateOfBirthFldEl.fill(data.dob, { force: true })
        }
        if (data.phoneNo1) {
            await this.enter(this.phoneNumberPriFldEl, data.phoneNo1)
        }

        if (data.phoneNo2) {
            await this.enter(this.phoneNumberSecFldEl, data.phoneNo2)
        }

        if (!data.address2) {
            await this.click(this.addressCheckEL)
        }

        if (data.address1) {
            await this.enter(this.addressLine1FldEl_1, data.address1.addressLine1)
            await this.enter(this.addressLine2FldEl_1, data.address1.addressLine2)
            await this.enter(this.addressLine3FldEl_1, data.address1.addressLine3)
            await this.enter(this.hometownFldEl_1, data.address1.hometown!)
            await this.select(this.countryFldEl_1,data.address1.country)
            if(data.address1.state){
                await this.select(this.stateFldEl_1,data.address1.state)
            }
            if(data.address1.district){
                await this.select(this.districtFldEl_1,data.address1.district)
            }
        }

        if (data.address2) {
            await this.enter(this.addressLine1FldEl_2, data.address2.addressLine1)
            await this.enter(this.addressLine2FldEl_2, data.address2.addressLine2)
            await this.enter(this.addressLine3FldEl_2, data.address2.addressLine3)
            await this.enter(this.hometownFldEl_2, data.address2.hometown!)
            await this.select(this.countryFldEl_2,data.address2.country)
            if(data.address2.state){
                await this.select(this.stateFldEl_2,data.address2.state)
            }
            if(data.address2.district){
                await this.select(this.districtFldEl_2,data.address2.district)
            }
        }
        await this.enter(this.aboutFldEl, data.about)
        await this.click(this.updateButtonEl)
        await this.assertText(this.alertEL,'Your profile data has been successfully updated.')
    }



}