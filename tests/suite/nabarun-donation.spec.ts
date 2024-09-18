import test, { Page } from "@playwright/test";
import { LoginPage } from "../pages/login";

import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { DonationPage } from "tests/pages/donations";

test.describe.serial('Create & Update Guest Donation : PAID', {
    tag: ['@regression', '@donation']
}, async () => {
    let page: Page;
    test.beforeAll(async ({ browser }) => { page = await browser.newPage(); });
    test.afterAll(async () => { await page.close(); });
    
    let donation: DonationPage;
    let donationId: string | null;


    test('Login as Cashier and Goto Donations', async ({}, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: 'souviksarrkar362@gmail.com',
            password: 'Password@01'
        })
        donation = await dashboard.gotoDonations();
    })

    test('Create Guest Donation', async ({}) => {
        donationId = await donation.addGuestDonation({
            amount: (100+randomInt(100)) ,
            email: faker.internet.email(),
            name: faker.person.fullName(),
            phoneNo: faker.phone.number({ style: 'international' })
        })
    })

    test('Update Guest Donation as PAID', async ({}) => {
        await donation.gotoTab('guest');
        await donation.search(undefined, { donationId: donationId! });
        await donation.updateDonation({
            id: donationId!,
            donorInfo: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
                phoneNo: faker.phone.number({ style: 'international' })
            },
            status: 'Paid',
            paidOn: '',
            paidTO: 'Quinten Volkman',
            paymentMethod: 'UPI',
            upiName: 'Google Pay',
            file: "C:\\Users\\Souvik\\Downloads\\RetiralSettlements.pptx"

        })
    })
})


