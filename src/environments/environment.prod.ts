// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";import config from "capacitor.config";
import { getScopes } from "src/app/core/constant/auth-scope.const";
import { version } from "./version";

const authDomain = 'sso-nabarun.us.auth0.com';
const authClientId = '8AzSWAAYeZdRC7taAICQkkxqpbtc3Bqm';

// const authConfig: AuthConfig = {
//   issuer: 'https://' + authDomain + '/',
//   logoutUrl: 'https://' + authDomain + '/v2/logout',
//   clientId: authClientId,
//   responseType: 'code',
//   scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(),
//   showDebugInformation: true,
//   useSilentRefresh: true,
//   strictDiscoveryDocumentValidation: false, // Set to true for production
//   redirectUri: Capacitor.isNativePlatform() ? `${config.appId}://${authDomain}/capacitor/${config.appId}/callback` : window.location.origin + '/callback',
//   postLogoutRedirectUri: Capacitor.isNativePlatform() ? `${config.appId}://${authDomain}/capacitor/${config.appId}/logout` : window.location.origin,
//   customQueryParams: { audience: 'https://nabarun.resourceserver.api' },
//   async openUri(uri:string) {
//     console.log(Capacitor.isNativePlatform())
//     if (Capacitor.isNativePlatform()) {
//       await Browser.open({ url: uri });
//     }else{
//       window.location.href=uri;
//     }
//   },
// }

const firebaseConfig = {
  apiKey: "AIzaSyD-kDzvTziMDGsDh40GJS3XVuL8A9_riQo",
  authDomain: "wengonabarun.firebaseapp.com",
  projectId: "wengonabarun",
  storageBucket: "wengonabarun.appspot.com",
  messagingSenderId: "496110742871",
  appId: "1:496110742871:web:ac779b109599ae719ae212",
  measurementId: "G-DY3169JJ99"
};

const gapiConfig ={
  apiKey: '-Ep0FD8sdwg',
  clientId:
    '-.apps.googleusercontent.com',
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  ],
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
  plugin_name:'nabarun_app'
  
};
export const environment = {
  production: true,
  name:version,
  max_idle_time_in_sec: 10,
  api_base_url: 'https://ngonabarun.appspot.com',
  //auth_config: authConfig,
  firebase_config: firebaseConfig,
  firebase_vapidKey:'BG5qo111TmZDK1avMtzLlbzw3w5lsN6-iAyrg-giZ7RSAmm9xh9CvapLAdTmz4JXLboiQ8_c9toYK7PDxHDWzSs',
  inactivityTimeOut: 15*60,
  gapi_config:gapiConfig

};


