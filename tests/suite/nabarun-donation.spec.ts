import test, { Page } from "@playwright/test";
import { LoginPage } from "../pages/login";
import { randomInt } from "crypto";
import { DonationPage } from "tests/pages/donations";
import { credentials } from "tests/data/cred";
import { NabarunPublicPage } from "tests/pages/public";
import { DashboardPage } from "tests/pages/dashboard";
import { constant } from "tests/data/constant";
import { faker } from "@faker-js/faker";
import { generateAllureReport } from "tests/config/allure-reporter";

test.describe.serial('DON_TC001: Create & Update Guest Donation : PAID', {
    tag: ['@regression', '@donation']
}, async () => {
    let page: Page;
    test.beforeAll(async ({ browser }) => { page = await browser.newPage(); });
    test.afterAll(async () => { await page.close(); generateAllureReport();});
    test.beforeEach(async ({}, testInfo) =>testInfo.setTimeout(testInfo.timeout + constant.eachTestTimeout));

    let donation: DonationPage;
    let donationId: string | null;


    test('DON_TC001_1: Login as Cashier and Goto Donations', async ({}, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: credentials.cashier.email,
            password: credentials.cashier.password
        })
        donation = await dashboard.gotoDonations();
    })

    test('DON_TC001_2: Create Guest Donation', async ({}) => {
        donationId = await donation.addGuestDonation({
            amount: (100+randomInt(100)) ,
            email: faker.internet.email(),
            name: faker.person.fullName(),
            phoneNo: faker.phone.number({ style: 'international' })
        })
    })

    test('DON_TC001_3: Update Guest Donation as PAID', async ({}) => {
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
            paidOn: new Date(),
            paidTO: 'Cashier Cashier',
            paymentMethod: 'UPI',
            upiName: 'Google Pay',
            file: "C:\\temp\\demo.pdf"

        })
    })
})


test.describe.serial('DON_TC002: Donate Now (Public) via UPI and confirm', {
    tag: ['@regression', '@donation']
}, async () => {
    let page: Page;
    test.beforeAll(async ({ browser }) => { page = await browser.newPage(); });
    test.afterAll(async () => { await page.close(); generateAllureReport();});
    test.beforeEach(async ({ }, testInfo) =>testInfo.setTimeout(testInfo.timeout + constant.eachTestTimeout));
    let requestId: string | null;
    let name:string | null;
    let dashboard: DashboardPage;

    test('DON_TC002_1: Donate Now ~ Public UPI', async ({}, testInfo) => {
        await page.goto('/')
        let publicPage = new NabarunPublicPage(page, testInfo);
        await publicPage.clickDonateNow()
        name = faker.person.firstName()+' '+faker.person.lastName();
        let email = faker.internet.email({ firstName: name, provider: 'gmail.com' });
        await publicPage.fillDonationDetail({
            name: name,
            email: email,
            number: faker.number.int({min:9000000001,max:9999999999})+'',
            amount: faker.number.int({min:100,max:300})+'',
        });
        requestId=await publicPage.confirmPayment('UPI');
    })

    test('DON_TC002_2: Login And Approve by Cashier', async ({}, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        dashboard = await loginPage.login({
            username: credentials.cashier.email,
            password: credentials.cashier.password
        })
        let workList = await dashboard.gotoWorkList();
        await workList.confirmDecisionTask({ id: requestId!, decision: 'APPROVE', remarks: 'ok Approved by cashier' });
        dashboard=await workList.backToDashboard();
    })

    test('DON_TC002_3: Check Donation Status as PAID', async ({}, testInfo) => {
        let donation = await dashboard.gotoDonations();
        await donation.gotoTab('guest');
        await donation.search(undefined,{donorName:name!})
        await donation.checkDonationStatus('Paid');
        await dashboard.logout();
    })
})




