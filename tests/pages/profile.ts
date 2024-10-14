import { expect, Locator, Page, TestInfo } from "playwright/test";
import { BasePage } from "./base";

export class ProfilePage extends BasePage {
    protected readonly updateProfileLinkEl: Locator;
    protected readonly titleFldEl: string ='//div[contains(text(),"Title")]/following-sibling::*//mat-select';
    protected readonly firstNameFldEl: string ='//div[contains(text(),"First Name")]/following-sibling::*//input';
    protected readonly middleNameFldEl: string ='//div[contains(text(),"Middle Name")]/following-sibling::*//input';
    protected readonly lastNameFldEl: string ='//div[contains(text(),"Last Name")]/following-sibling::*//input';
    protected readonly genderFldEl: string ='//div[contains(text(),"Gender")]/following-sibling::*//mat-select';
    protected readonly dateOfBirthFldEl: string ='//div[contains(text(),"Date of Birth")]/following-sibling::*//mat-datepicker-toggle';
    protected readonly phoneNumberPriFldEl: string ='//div[contains(text(),"Phone Number (WhatsApp)")]/following-sibling::*//input';
    protected readonly phoneNumberSecFldEl: string ='//div[contains(text(),"Phone Number (Alternative)")]/following-sibling::*//input';
    protected readonly addressCheckEL: string ='//*[contains(text(),"Permanent Address same as Present Address")]';
    protected readonly addressLine1FldEl_1: string ='(//div[contains(text(),"Address Line 1")]/following-sibling::*//input)[1]';
    protected readonly addressLine1FldEl_2: string ='(//div[contains(text(),"Address Line 1")]/following-sibling::*//input)[2]';
    protected readonly addressLine2FldEl_1: string ='(//div[contains(text(),"Address Line 2")]/following-sibling::*//input)[1]';
    protected readonly addressLine3FldEl_1: string ='(//div[contains(text(),"Address Line 3")]/following-sibling::*//input)[1]';
    protected readonly hometownFldEl_1: string ='(//div[contains(text(),"Hometown")]/following-sibling::*//input)[1]';
    protected readonly countryFldEl_1: string ='(//div[contains(text(),"Country")]/following-sibling::*//mat-select)[1]';
    protected readonly stateFldEl_1: string ='//*[contains(text(),"Permanent Address same as Present Address")]/preceding::*//div[contains(text(),"State")]/following-sibling::*//mat-select';
    protected readonly districtFldEl_1: string ='//*[contains(text(),"Permanent Address same as Present Address")]/preceding::*//div[contains(text(),"District")]/following-sibling::*//mat-select';
    protected readonly addressLine2FldEl_2: string ='(//div[contains(text(),"Address Line 2")]/following-sibling::*//input)[2]';
    protected readonly addressLine3FldEl_2: string ='(//div[contains(text(),"Address Line 3")]/following-sibling::*//input)[2]';
    protected readonly hometownFldEl_2: string ='(//div[contains(text(),"Hometown")]/following-sibling::*//input)[2]';
    protected readonly countryFldEl_2: string ='(//div[contains(text(),"Country")]/following-sibling::*//mat-select)[2]';
    protected readonly stateFldEl_2: string ='//*[contains(text(),"Permanent Address same as Present Address")]/following::*//div[contains(text(),"State")]/following-sibling::*//mat-select';
    protected readonly districtFldEl_2: string ='//*[contains(text(),"Permanent Address same as Present Address")]/following::*//div[contains(text(),"District")]/following-sibling::*//mat-select';
    protected readonly aboutFldEl: string ='//*[contains(text(),"Descrive something about you")]/following-sibling::*//textarea';
    protected readonly facebookLinkFldEl: string ='//*[contains(text(),"Facebook Link")]/following-sibling::*//input';
    protected readonly instagramLinkFldEl: string ='//*[contains(text(),"Instagram Link")]/following-sibling::*//input';
    protected readonly linkedInLinkFldEl: string ='//*[contains(text(),"LinkedIn Link")]/following-sibling::*//input';
    protected readonly twitterLinkFldEl: string =''//*[contains(text(),"Twitter Link")]/following-sibling::*//input'';
    protected readonly updateButtonEl: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.updateProfileLinkEl = page.getByRole('button', { name: 'Update Profile' });
        this.updateButtonEl = page.getByRole('button', { name: 'Update',exact:true });

        // this.titleFldEl = page.locator()
        // this.firstNameFldEl = page.locator()
        // this.middleNameFldEl = page.locator()
        // this.lastNameFldEl = page.locator()
        // this.genderFldEl = page.locator()
        // this.dateOfBirthFldEl = page.locator()
        // this.phoneNumberPriFldEl = page.locator()
        // this.phoneNumberSecFldEl = page.locator()
        // this.addressCheckEL = page.locator()

        // this.addressLine1FldEl_1 = page.locator()
        // this.addressLine2FldEl_1 = page.locator()
        // this.addressLine3FldEl_1 = page.locator()
        // this.hometownFldEl_1 = page.locator()
        // this.countryFldEl_1 = page.locator()
        // this.stateFldEl_1 = page.locator()
        // this.districtFldEl_1 = page.locator()

        // this.addressLine1FldEl_2 = page.locator()
        // this.addressLine2FldEl_2 = page.locator()
        // this.addressLine3FldEl_2 = page.locator()
        // this.hometownFldEl_2 = page.locator()
        // this.countryFldEl_2 = page.locator()
        // this.stateFldEl_2 = page.locator()
        // this.districtFldEl_2 = page.locator()
        // this.aboutFldEl = page.locator()
        // this.facebookLinkFldEl = page.locator()
        // this.instagramLinkFldEl = page.locator()
        // this.linkedInLinkFldEl = page.locator()
        // this.twitterLinkFldEl = page.locator()
        
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
        this.updateProfileLinkEl.click()
        if (data.title) {
            await this.select(this.titleFldEl, data.title)
        }
        if (data.firstName) {
            await this.page.fill(this.firstNameFldEl, data.firstName)
        }
        if (data.middleName) {
            await this.page.fill(this.middleNameFldEl, data.middleName)
        }
        if (data.lastName) {
            await this.page.fill(this.lastNameFldEl, data.lastName)
        }
        if (data.gender) {
            await this.select(this.genderFldEl, data.gender)
        }
        if (data.dob) {
            await this.selectdate(this.dateOfBirthFldEl,{
                date:data.dob.split("-")[0],
                month:data.dob.split("-")[1],
                year:data.dob.split("-")[2]
            })
        }
        if (data.phoneNo1) {
            await this.page.fill(this.phoneNumberPriFldEl, data.phoneNo1)
        }

        if (data.phoneNo2) {
            await this.page.fill(this.phoneNumberSecFldEl, data.phoneNo2)
        }

        if (!data.address2) {
            await this.page.click(this.addressCheckEL)
        }

        if (data.address1) {
            await this.page.fill(this.addressLine1FldEl_1, data.address1.addressLine1)
            await this.page.fill(this.addressLine2FldEl_1, data.address1.addressLine2)
            await this.page.fill(this.addressLine3FldEl_1, data.address1.addressLine3)
            await this.page.fill(this.hometownFldEl_1, data.address1.hometown!)
            await this.select(this.countryFldEl_1,data.address1.country)
            if(data.address1.state){
                await this.select(this.stateFldEl_1,data.address1.state)
            }
            if(data.address1.district){
                await this.select(this.districtFldEl_1,data.address1.district)
            }
        }

        if (data.address2) {
            await this.page.fill(this.addressLine1FldEl_2, data.address2.addressLine1)
            await this.page.fill(this.addressLine2FldEl_2, data.address2.addressLine2)
            await this.page.fill(this.addressLine3FldEl_2, data.address2.addressLine3)
            await this.page.fill(this.hometownFldEl_2, data.address2.hometown!)
            await this.select(this.countryFldEl_2,data.address2.country)
            if(data.address2.state){
                await this.select(this.stateFldEl_2,data.address2.state)
            }
            if(data.address2.district){
                await this.select(this.districtFldEl_2,data.address2.district)
            }
        }
        await this.page.fill(this.aboutFldEl, data.about)
        await this.updateButtonEl.click()
        //await this.assertText(this.alertEL,'')
        await expect.soft(this.page.locator(this.alertEL)).toContainText('Your profile data has been successfully updated.')

    }



}