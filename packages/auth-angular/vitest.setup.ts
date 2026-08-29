import 'zone.js';
import 'zone.js/testing';
import { afterEach } from 'vitest';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

afterEach(() => {
  TestBed.resetTestingModule();
});
