// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { AuthConfig } from "angular-oauth2-oidc";
import { getScopes } from "src/app/core/constant/auth-scope.const";
import { Capacitor } from '@capacitor/core';
import config from '../../capacitor.config';
import { Browser } from "@capacitor/browser";
import { version } from "./version";

const authDomain = 'dev-u2aco2py.us.auth0.com';
const authClientId = '8DLWlfdUodZhM8nW2HRKFYL7GjBxMbGH';
const authConfig: AuthConfig = {
  issuer: 'https://' + authDomain + '/',
  logoutUrl: 'https://' + authDomain + '/v2/logout',
  clientId: authClientId,
  responseType: 'code',
  scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(),
  showDebugInformation: true,
  useSilentRefresh: true,
  strictDiscoveryDocumentValidation: false, // Set to true for production
  redirectUri: Capacitor.isNativePlatform() ? `${config.appId}://${authDomain}/capacitor/${config.appId}/callback` : window.location.origin + '/callback',
  postLogoutRedirectUri: Capacitor.isNativePlatform() ? `${config.appId}://${authDomain}/capacitor/${config.appId}/logout` : window.location.origin,
  customQueryParams: { audience: 'https://nabarun.resourceserver.api', device:'M' },
  async openUri(uri:string) {
    console.log(Capacitor.isNativePlatform())
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: uri });
    }else{
      window.location.href=uri;
    }
  },
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLw5Ry_9dUOFPbuwoiAzwII99CVMpz978",
  authDomain: "nabarun-test.firebaseapp.com",
  databaseURL: "https://nabarun-test-default-rtdb.firebaseio.com",
  projectId: "nabarun-test",
  storageBucket: "nabarun-test.appspot.com",
  messagingSenderId: "595475200212",
  appId: "1:595475200212:web:5fb71eac858442e0046341",
  measurementId: "G-PT9V4XMXWY"
};

const gapiConfig ={
  apiKey: 'AIzaSyDEQ5433AfdAoTOOCqjlK9K-Ep0FD8sdwg',
  clientId:
    '595475200212-gibsoge21ed013o9obcreldfpfncgops.apps.googleusercontent.com',
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  ],
  scope: 'https://www.googleapis.com/auth/calendar.events',//https://www.googleapis.com/auth/calendar 
  plugin_name:'nabarun_app'
  
};


export const environment = {
  production: false,
  name:'DEV-WEB '+version,
  max_idle_time_in_sec: 10,
  api_base_url: 'http://'+window.location.hostname+':8082',
  auth_config: authConfig,
  firebase_config: firebaseConfig,
  firebase_vapidKey:'BBDkLXhO325xFYbQ9v2yDhAlxRCBwB-MERVALRhUsiPjKWNAFiR1LVxgdxB8M8VVXD6ZBMQllGFdfjmIG0CGvig',
  inactivityTimeOut: 120*60,
  gapi_config:gapiConfig,

};

