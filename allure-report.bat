@echo off
xcopy "%~dp0\\allure-report\\history" "%~dp0\\allure-results\\history" /e /i /y
npx allure generate --clean 

