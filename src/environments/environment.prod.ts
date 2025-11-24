// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { getScopes } from "src/app/core/constant/auth-scope.const";
import { version } from "./version";
import { AuthConfig } from "@auth0/auth0-angular";


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
  apiKey: 'AIzaSyBYP4sshue06ft65C2qyYoXV4PQ2cb_ThM',
  clientId:
    '496110742871-673vscum8up3kb0ivhmnooi9m9udpoqp.apps.googleusercontent.com',
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  ],
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
  plugin_name:'nabarun_app_p'
  
};



const authDomain = 'sso-nabarun.us.auth0.com';
const authClientId ='8AzSWAAYeZdRC7taAICQkkxqpbtc3Bqm';
const apiBaseUrl='https://ngonabarun.appspot.com';

const auth_config:AuthConfig={
  domain: authDomain,
  clientId: authClientId,
  authorizationParams: {
    redirect_uri: window.location.origin ,  
    scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(), 
    audience: 'https://nabarun.resourceserver.api' ,
  },
  httpInterceptor:{
    allowedList:[
      {
        uriMatcher(uri) {
          return uri.includes(apiBaseUrl)
        },
      }
    ]
  }
}


export const environment = {
  production: true,
  name:version,
  max_idle_time_in_sec: 600,
  api_base_url: apiBaseUrl,
  api_base_url2: 'http://localhost:8080',
  auth_config: auth_config,
  firebase_config: firebaseConfig,
  firebase_vapidKey:'BG5qo111TmZDK1avMtzLlbzw3w5lsN6-iAyrg-giZ7RSAmm9xh9CvapLAdTmz4JXLboiQ8_c9toYK7PDxHDWzSs',
  inactivityTimeOut: 15*60,

};

