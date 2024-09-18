import { AllureReporter } from "allure-playwright";

export default async function tearDown() {
    console.log('Hello dear')
    AllureReporter
};