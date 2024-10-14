import test, { Page } from "@playwright/test";
import { NabarunPublicPage } from "../pages/public";
import { LoginPage } from "../pages/login";
import { credentials } from "tests/data/cred";
import { DashboardPage } from "tests/pages/dashboard";
import { constant } from "tests/data/constant";
import { faker } from "@faker-js/faker";
import { generateAllureReport } from "tests/config/allure-reporter";

test.describe.serial('MEM_TC001: Onboard member End 2 End', {
    tag: ['@regression', '@sanity', '@member']
}, async () => {
    let page: Page;
    test.beforeAll(async ({ browser }) => { page=await browser.newPage(); });
    test.afterAll(async () => { await page.close();generateAllureReport(); });
    test.beforeEach(async ({}, testInfo) =>testInfo.setTimeout(testInfo.timeout + constant.eachTestTimeout));
    let requestId: string | null;
    let email: string | null;
        
    test('MEM_TC001_1: Complete registration functionality', async ({}, testInfo) => {
        await page.goto('/')
        let publicPage = new NabarunPublicPage(page, testInfo);
        await publicPage.clickJoinUs()
        let firstname = faker.person.firstName();
        let lastname = faker.person.lastName();
        email = faker.internet.email({ firstName: firstname, lastName: lastname, provider: 'nabarun.com' });
        await publicPage.fillJoiningForm({
            email: email,
            firstName: firstname,
            lastName: lastname,
            phoneCode: '91',
            phoneNumber: faker.number.int({min:9000000001,max:9999999999})+'',
            howDoYouKnowAboutNabarun: faker.lorem.sentence(5),
            whereAreYouFrom: faker.location.city(),
            whyDoYouWantToJoinNabarun: faker.lorem.sentence(5)
        });
        await publicPage.agreeAndContinue()
        await publicPage.fillLoginDetail({ password: credentials.defaultPassword })
        requestId = await publicPage.submit();
        console.log(requestId)
    })

    test('MEM_TC001_2: Login And Approve 1', async ({}, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: credentials.secretory.email,
            password: credentials.secretory.password
        })
        let workList = await dashboard.gotoWorkList();
        await workList.confirmDecisionTask({ id: requestId!, decision: 'APPROVE', remarks: 'ok Approved by 1' });
        await dashboard.logout();
    })
    test('MEM_TC001_3: Login And Approve 2', async ({}, testInfo) => {
        //await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: credentials.president.email,
            password: credentials.president.password
        })
        let workList = await dashboard.gotoWorkList();
        await workList.confirmDecisionTask({ id: requestId!, decision: 'APPROVE', remarks: 'ok Approved by 2' });
        await dashboard.logout();
    })
    let dashboard: DashboardPage;
    test('MEM_TC001_4: Login check Onboarded user', async ({}, testInfo) => {
        //await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        dashboard = await loginPage.login({
            username: email!,
            password: credentials.defaultPassword
        });
        await dashboard.checkDashboardTitle();
    })

    test('MEM_TC001_5: Check task and update profile', async ({}, testInfo) => {
        let workList=await dashboard.gotoWorkList();
        await workList.checkIfTaskExists('Update Self Profile');
        let profile = await dashboard.gotoMyProfile();
        await profile.updateMyProfile({
            about: faker.lorem.text(),
            title: 'Mr',
            gender: 'Male',
            dob:'13-JAN-1998',
            phoneNo1: faker.phone.number().replaceAll('-', ''),
            phoneNo2: faker.phone.number().replaceAll('-', ''),
            address1: {
                addressLine1: faker.location.streetAddress(),
                addressLine2: faker.location.streetAddress(),
                addressLine3: faker.location.streetAddress(),
                hometown: faker.location.city(),
                country: 'Greece'
            },
            address2: {
                addressLine1: faker.location.streetAddress(),
                addressLine2: faker.location.streetAddress(),
                addressLine3: faker.location.streetAddress(),
                hometown: faker.location.city(),
                country: 'India',
                state: 'West Bengal',
                district: 'Purulia'
            }
        })
        dashboard = await profile.backToDashboard()
        workList=await dashboard.gotoWorkList();
        await workList.checkIfTaskExists('Update Self Profile',true);
        await dashboard.logout()
    })
})


