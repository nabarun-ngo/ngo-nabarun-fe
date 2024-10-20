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

test.describe.serial('DON_TC001', {
    tag: ['@regression', '@donation']
}, async () => {
    let page: Page;
    test.beforeAll(async ({ browser }) => { page = await browser.newPage(); });
    test.afterAll(async () => { 
        if(page){ await page.close(); }
        generateAllureReport();
    });
    test.beforeEach(async ({}, testInfo) =>testInfo.setTimeout(testInfo.timeout + constant.eachTestTimeout));

    let donation: DonationPage;
    let donationId: string | null;
    let dashboard:DashboardPage;

    test('DON_TC001_1: Login as Cashier and Goto Donations', async ({}, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        dashboard = await loginPage.login({
            username: credentials.cashier.email,
            password: credentials.cashier.password
        })
    })

    /**
     * Guest Tab Tests
     */
    test('DON_TC001_2: Create Guest Donation - Event No & Update as PAID', async ({}) => {
        donation = await dashboard.gotoDonations();
        await donation.gotoTab('guest');
        donationId = await donation.addGuestDonation({
            amount: (100+randomInt(100)) ,
            email: faker.internet.email(),
            name: faker.person.fullName(),
            phoneNo: faker.phone.number({ style: 'international' })
        })
        await donation.search(undefined, { donationId: donationId! });
        await donation.checkDonationStatus('Raised')
       // await donation.search(undefined, { close:true });
        // update
       // await donation.gotoTab('guest');
       // await donation.search(undefined, { donationId: donationId! });
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
        await donation.search(undefined, { donationId: donationId!, isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Paid')
        await donation.search(undefined, { close:true });
        await donation.backToDashboard();
    })

    test('DON_TC001_3: Create Guest Donation - Event Yes & Update as Cancelled', async ({}) => {
        donation = await dashboard.gotoDonations();
        await donation.gotoTab('guest');
        donationId = await donation.addGuestDonation({
            amount: (100+randomInt(100)) ,
            email: faker.internet.email(),
            name: faker.person.fullName(),
            phoneNo: faker.phone.number({ style: 'international' }),
            eventIndex:1
        })
        await donation.search(undefined, { donationId: donationId! });
        await donation.checkDonationStatus('Raised')
        //await donation.search(undefined, { close:true });
        //await donation.gotoTab('guest');
        //await donation.search(undefined, { donationId: donationId! });
        await donation.updateDonation({
            id: donationId!,
            status: 'Cancelled',
            comment: 'cancel comment for testing'
        })
        await donation.search(undefined, { donationId: donationId!, isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Cancelled')
        await donation.search(undefined, { close:true });
        await donation.backToDashboard();

    })

    test('DON_TC001_4: Create Member Donation - ONETIME - Event No & Update as Cancelled', async ({}) => {
        donation = await dashboard.gotoDonations();
        await donation.gotoTab('member');
        donationId = await donation.searchAndAddMemberDonation({
            amount: (100+randomInt(100)) ,
            donationType: 'One Time',
            member:{
                firstName:'Test',
                lastName:'Test123'
            }
        })
        await donation.gotoTab('all');
        await donation.search(undefined, { donationId: donationId!,isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Raised')
        await donation.search(undefined, { close:true });
        await donation.search(undefined, { donationId: donationId! });
        await donation.updateDonation({
            id: donationId!,
            status: 'Cancelled',
            comment:'Comment for cancel'
        })
        await donation.search(undefined, { donationId: donationId!, isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Cancelled')
        await donation.search(undefined, { close:true });
        await donation.backToDashboard();

    })


    test('DON_TC001_4: Create Member Donation - ONETIME - Event No & Update as paid', async ({}) => {
        donation = await dashboard.gotoDonations();
        await donation.gotoTab('member');
        donationId = await donation.searchAndAddMemberDonation({
            amount: (100+randomInt(100)) ,
            donationType: 'One Time',
            member:{
                firstName:'Test',
                lastName:'Test123'
            }
        })
        await donation.gotoTab('all');
        await donation.search(undefined, { donationId: donationId!,isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Raised')
        await donation.search(undefined, { close:true });
        await donation.search(undefined, { donationId: donationId! });
        await donation.updateDonation({
            id: donationId!,
            status: 'Paid',
            paidOn: new Date(),
            paidTO: 'Cashier Cashier',
            paymentMethod: 'UPI',
            upiName: 'Google Pay',
            file: "C:\\temp\\demo.pdf"
        })
        await donation.search(undefined, { donationId: donationId!, isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Paid')
        await donation.search(undefined, { close:true });
        await donation.backToDashboard();

    })

    test('DON_TC001_5: Create Member Donation - ONETIME - Event No & Update as paid', async ({}) => {
        donation = await dashboard.gotoDonations();
        await donation.gotoTab('member');
        let startDate= new Date();
        startDate.setDate(1);
        let endDate= new Date();
        endDate.setDate(28);
        donationId = await donation.searchAndAddMemberDonation({
            amount: (100+randomInt(100)) ,
            donationType: 'Regular',
            startDate: startDate,
            endDate:endDate,
            member:{
                firstName:'Test',
                lastName:'Test123'
            }
        })
        await donation.gotoTab('all');
        await donation.search(undefined, { donationId: donationId!,isAdvSearchAlreadyOpen:true });
        await donation.checkDonationStatus('Raised')
        await donation.search(undefined, { close:true });
        await donation.search(undefined, { donationId: donationId! });
        await donation.updateDonation({
            id: donationId!,
            status: 'Pending',
        })
        await donation.search(undefined, { donationId: donationId!,isAdvSearchAlreadyOpen:true });
        await donation.updateDonation({
            id: donationId!,
            status: 'Payment Failed',
            comment:'payment is failed'
        })
        await donation.search(undefined, { donationId: donationId!,isAdvSearchAlreadyOpen:true });
        await donation.updateDonation({
            id: donationId!,
            status: 'Paid',
            paidOn: new Date(),
            paidTO: 'Cashier Cashier',
            paymentMethod: 'UPI',
            upiName: 'Google Pay',
            file: "C:\\temp\\demo.pdf"
        })
        await donation.search(undefined, { donationId: donationId!,isAdvSearchAlreadyOpen:true });

        await donation.updateDonation({ 
            id: donationId!,
            status: 'Wrong Payment Update',
            comment:'wrong payment'
        })
        await donation.search(undefined, { donationId: donationId!, isAdvSearchAlreadyOpen:true });
        await donation.updateDonation({ 
            id: donationId!,
            status: 'Raised',
        })
        await donation.search(undefined, { donationId: donationId!, isAdvSearchAlreadyOpen:true });
        await donation.updateDonation({ 
            id: donationId!,
            status: 'Cancelled',
            comment:'Jaah Cancelled'
        })
        await donation.checkDonationStatus('Cancelled')
        await donation.search(undefined, { close:true });
        await donation.backToDashboard();

    })

    
})



test.describe.serial('DON_TC002', {
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
        requestId=await publicPage.confirmPayment('UPI',"C:\\temp\\demo.pdf");
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




