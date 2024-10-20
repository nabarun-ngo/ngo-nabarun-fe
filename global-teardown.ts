import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateAllureReport } from 'tests/config/allure-reporter';

// Global teardown function
export default async function globalTeardown() {
   await generateAllureReport()
}