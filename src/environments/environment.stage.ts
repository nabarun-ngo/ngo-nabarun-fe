// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { getScopes } from "src/app/core/constant/auth-scope.const";
import { version } from "./version";
import { AuthConfig } from "@auth0/auth0-angular";

const authDomain = 'sso-nabarun-test.us.auth0.com';
const authClientId = 'RAcWqnITnhfXPTLhFLVtAzWxeujR5Znk';
const apiBaseUrl = 'https://ngonabarun-stage.appspot.com';
const apiBaseUrl2 = 'https://api-dot-ngonabarun-stage.appspot.com';

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

// Import Firebase configuration from JSON file
import firebaseConfigJson from './firebase-config.stage.json';
import { FirebaseConfig } from './firebase-config.type';

// Type assertion for Firebase config
const firebaseConfig = firebaseConfigJson as FirebaseConfig;

export const environment = {
  production: false,
  name: 'STAGE-WEB ' + version,
  max_idle_time_in_sec: 10,
  api_base_url: apiBaseUrl,
  api_base_url2: apiBaseUrl2,
  auth_config: auth_config,
  firebase_config: firebaseConfig,
  firebase_vapidKey: 'BGAsJtqzuGvkRCJKLFlOlkHGfkceQ1iRV1kcEZB2oCkLZY_vptQLBqWha5_P9kGgunGa4JVNG6Dm5VNOaCkv-ME',
  inactivityTimeOut: 30 * 60,
};




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
//     ////console.log(Capacitor.isNativePlatform())
//     if (Capacitor.isNativePlatform()) {
//       await Browser.open({ url: uri });
//     }else{
//       window.location.href=uri;
//     }
//   },
// }