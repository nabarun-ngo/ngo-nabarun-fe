import test, { Page } from "@playwright/test";
import { NabarunPublicPage } from "../pages/public";
import { LoginPage } from "../pages/login";

import { faker } from "@faker-js/faker";

// test.describe.configure({ mode: 'serial' });
// test.setTimeout(5 * 60 * 1000);



test.describe.serial('Onboard member End 2 End', {
    tag: ['@regression','@sanity']
}, async () => {
    let page: Page;
    let requestId: string | null;
    let email: string | null;;
    test.beforeAll(async ({ browser }) => { page = await browser.newPage(); });
    test.afterAll(async () => { await page.close(); });
    test('Complete registration functionality', async ({ browser }, testInfo) => {
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
            phoneNumber: '1111111111',
            howDoYouKnowAboutNabarun: faker.lorem.sentence(5),
            whereAreYouFrom: faker.location.city(),
            whyDoYouWantToJoinNabarun: faker.lorem.sentence(5)
        });
        await publicPage.agreeAndContinue()
        await publicPage.fillLoginDetail({ password: 'Password@01' })
        requestId = await publicPage.submit();
        console.log(requestId)
    })

    test('Login And Approve 1',  async ({ browser }, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: 'souviksarrkar362@gmail.com',
            password: 'Password@01'
        })
        let workList = await dashboard.gotoWorkList();
        await workList.confirmDecisionTask({ id: requestId!, decision: 'APPROVE', remarks: 'ok Approved by 1' });
        await dashboard.logout();
    })
    test('Login And Approve 2', async ({ browser }, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: 'president@nabarun.com',
            password: 'Password@01'
        })
        let workList = await dashboard.gotoWorkList();
        await workList.confirmDecisionTask({ id: requestId!, decision: 'APPROVE', remarks: 'ok Approved by 2' });
        await dashboard.logout();
    })

    test('Login check Onboarded user', async ({ browser }, testInfo) => {
        await page.goto(process.env['LOGIN_URL']!)
        let loginPage = new LoginPage(page, testInfo);
        await loginPage.continueWithPassword();
        let dashboard = await loginPage.login({
            username: email!,
            password: 'Password@01'
        });
        await dashboard.logout()
    })
})


