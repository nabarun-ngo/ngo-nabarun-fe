// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { getScopes } from "src/app/core/constant/auth-scope.const";
import { version } from "./version";
import { AuthConfig } from "@auth0/auth0-angular";

const authDomain = 'dev-u2aco2py.us.auth0.com';
const authClientId = '8DLWlfdUodZhM8nW2HRKFYL7GjBxMbGH';
const apiBaseUrl = 'http://localhost:8082';
const apiBaseUrl2 = 'http://localhost:8080';

const auth_config: AuthConfig = {
  domain: authDomain,
  clientId: authClientId,
  authorizationParams: {
    redirect_uri: window.location.origin,
    scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(),
    audience: 'https://nabarun.resourceserver.api',
  },
  httpInterceptor: {
    allowedList: [{
      uriMatcher(uri) {
        return uri.startsWith(apiBaseUrl) || uri.startsWith(apiBaseUrl2)
      },
    }]
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

const gapiConfig = {
  apiKey: 'AIzaSyDEQ5433AfdAoTOOCqjlK9K-Ep0FD8sdwg',
  clientId:
    '595475200212-gibsoge21ed013o9obcreldfpfncgops.apps.googleusercontent.com',
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  ],
  scope: 'https://www.googleapis.com/auth/calendar.events',//https://www.googleapis.com/auth/calendar 
  plugin_name: 'nabarun_app'

};


export const environment = {
  production: false,
  name: 'DEV-WEB ' + version,
  max_idle_time_in_sec: 10,
  api_base_url: apiBaseUrl,
  api_base_url2: apiBaseUrl2,
  firebase_config: firebaseConfig,
  firebase_vapidKey: 'BBDkLXhO325xFYbQ9v2yDhAlxRCBwB-MERVALRhUsiPjKWNAFiR1LVxgdxB8M8VVXD6ZBMQllGFdfjmIG0CGvig',
  inactivityTimeOut: 120 * 60,
  auth_config: auth_config,
};
