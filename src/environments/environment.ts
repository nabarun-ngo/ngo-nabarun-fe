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


// Import Firebase configuration from JSON file
import firebaseConfigJson from './firebase-config.json';
import { FirebaseConfig } from './firebase-config.type';

// Type assertion for Firebase config
const firebaseConfig = firebaseConfigJson as FirebaseConfig;

export const environment = {
  production: false,
  name: 'DEV-WEB ' + version,
  max_idle_time_in_sec: 10,
  api_base_url: apiBaseUrl,
  api_base_url2: apiBaseUrl2,
  firebase_config: firebaseConfig,
  firebase_vapidKey: 'BGAsJtqzuGvkRCJKLFlOlkHGfkceQ1iRV1kcEZB2oCkLZY_vptQLBqWha5_P9kGgunGa4JVNG6Dm5VNOaCkv-ME',
  inactivityTimeOut: 120 * 60,
  auth_config: auth_config,
};
