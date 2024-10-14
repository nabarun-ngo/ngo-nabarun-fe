import { execSync } from 'child_process';
import { FullResult, Reporter } from 'playwright/types/testReporter';
import * as fs from 'fs-extra';
import * as path from 'path';

export async function generateAllureReport(){
  console.log('Global teardown: Copying history and generating Allure report...');
  
  const allureReportPath = path.resolve(__dirname, './allure-report');
  const allureResultsPath = path.resolve(__dirname, './allure-results');
  const historyFolderPath = path.join(allureReportPath, 'history');
  const targetHistoryPath = path.join(allureResultsPath, 'history');

  try {
    // Step 1: Copy history from previous report
    if (fs.existsSync(historyFolderPath)) {
      console.log('Copying Allure history from previous report...');
      await fs.copy(historyFolderPath, targetHistoryPath);
      console.log('History copied successfully!');
    } else {
      console.log('No history folder found in the previous report.');
    }

    // Step 2: Generate the Allure report
    console.log('Generating Allure report...');
    execSync('npx allure generate ./allure-results --clean', { stdio: 'inherit' });
    console.log('Report ready to serve...');
  } catch (error) {
    console.error('Error during global teardown:', error);
  }
}

