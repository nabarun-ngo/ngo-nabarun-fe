import test, { Page } from "@playwright/test";
import { LoginPage } from "../pages/login";

import { faker } from "@faker-js/faker";
import { DashboardPage } from "../pages/dashboard";
import { DonationPage } from "../pages/donations";
import { randomInt } from "crypto";

test.describe.serial('Create & Update Guest Donation : PAID', {
    tag: ['@regression','@donation']
}, async () => {
    let dashboard: DashboardPage;
    let donation: DonationPage;
    let donationId: string | null;
    test('Login as Cashier', async ({ page }, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        dashboard = await loginPage.login({
            username: 'souviksarrkar362@gmail.com',
            password: 'Password@01'
        })
    })

    test('Create Guest Donation', async ({ browser }) => {
        donation = await dashboard.gotoDonations();
        donationId = await donation.addGuestDonation({
            amount: randomInt(3),
            email: faker.internet.email(),
            name: faker.person.fullName(),
            phoneNo: faker.phone.number({ style: 'international' })
        })
    })

    test('Update Guest Donation as PAID', async ({ browser }) => {
        //console.log(donationId)
        // await donation.updateDonation({
        //     id:'',
        //     amount:randomInt(3),
        //     email:faker.internet.email(),
        //     name:faker.person.fullName(),
        //     phoneNo:faker.phone.number({style:'international'})
        // })
    })
})

test.describe.serial('Create & Update Guest Donation', {
    tag: ['@regression','@donation']
}, async () => {
    test('Create Member Donation Manually', async ({ browser }) => {

    })

    test('Update Member Donation', async ({ browser }) => {

    })
})




