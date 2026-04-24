// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { getScopes } from "src/app/core/constant/auth-scope.const";
import { version } from "./version";
import { AuthConfig } from "@auth0/auth0-angular";


import { FirebaseConfig } from './firebase-config.type';

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyB2EzMmq3uZUBcaubYMtISF-CKQPPujOxk",
  authDomain: "ngonabarun.firebaseapp.com",
  projectId: "ngonabarun",
  storageBucket: "ngonabarun.firebasestorage.app",
  messagingSenderId: "366182857375",
  appId: "1:366182857375:web:37146914cb8fd501a580aa"
};



const authDomain = 'sso-nabarun.us.auth0.com';
const authClientId = '8AzSWAAYeZdRC7taAICQkkxqpbtc3Bqm';
const apiBaseUrl = 'https://ngonabarun.appspot.com';
const apiBaseUrl2 = 'https://api-dot-ngonabarun.appspot.com';

const auth_config: AuthConfig = {
  domain: authDomain,
  clientId: authClientId,
  authorizationParams: {
    redirect_uri: window.location.origin,
    scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(),
    audience: 'https://nabarun.resourceserver.api',
  },
  httpInterceptor: {
    allowedList: [
      {
        uriMatcher(uri) {
          return uri.startsWith(apiBaseUrl) || uri.startsWith(apiBaseUrl2)
        },
      }
    ]
  }
}

const mobile_auth_config = {
  ...auth_config,
  clientId: 'o1WzBSYjyhinq1U9CHBmBHZ5GWNDV70D', // Update if different for Prod Mobile
  appId: 'com.ngonabarun.app'
}


export const environment = {
  production: true,
  registerServiceWorker: true,
  name: version,
  max_idle_time_in_sec: 600,
  api_base_url: apiBaseUrl,
  api_base_url2: apiBaseUrl2,
  auth_config: auth_config,
  firebase_config: firebaseConfig,
  firebase_vapidKey: 'BB5aUQjSGz0v2f2mvf_PdMIsG5zl-uBZ3c8jW3oj6DXn0fLoA98oLG3GzJxWizKyTIME7GOrIzN_vdmI_XhhGps',
  inactivityTimeOut: 15 * 60,
  mobile_auth_config: mobile_auth_config,
  onesignal_app_id: "9b60ad89-4a1a-4a52-8b09-bed4f8e83c96",
};
