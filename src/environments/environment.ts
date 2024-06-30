// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { AuthConfig } from "angular-oauth2-oidc";
import { getScopes } from "src/app/core/constant/auth-scope.const";

const authDomain = 'dev-u2aco2py.us.auth0.com';
const authClientId = '8DLWlfdUodZhM8nW2HRKFYL7GjBxMbGH';
const authConfig: AuthConfig = {
  issuer: 'https://' + authDomain + '/',
  logoutUrl: 'https://' + authDomain + '/v2/logout',
  clientId: authClientId,
  responseType: 'code',
  scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(),
  showDebugInformation: true,
  postLogoutRedirectUri: window.location.origin,
  customQueryParams: { audience: 'https://nabarun.resourceserver.api', device:'M' },
  redirectUri: window.location.origin + '/callback'
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


export const environment = {
  production: false,
  name:'DEV-WEB',
  max_idle_time_in_sec: 10,
  api_base_url: 'http://'+window.location.hostname+':8082',
  auth_config: authConfig,
  firebase_config: firebaseConfig,
  firebase_vapidKey:'BBDkLXhO325xFYbQ9v2yDhAlxRCBwB-MERVALRhUsiPjKWNAFiR1LVxgdxB8M8VVXD6ZBMQllGFdfjmIG0CGvig',
  inactivityTimeOut: 15*60
};

