// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { AuthConfig } from "angular-oauth2-oidc";
import { getScopes } from "src/app/core/constant/auth-scope.const";

const authDomain = 'sso-nabarun.us.auth0.com';
const authClientId = '8AzSWAAYeZdRC7taAICQkkxqpbtc3Bqm';

const authConfig: AuthConfig = {
  issuer: 'https://' + authDomain + '/',
  logoutUrl: 'https://' + authDomain + '/v2/logout',
  clientId: authClientId,
  responseType: 'code',
  scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud ' + getScopes(),
  showDebugInformation: true,
  postLogoutRedirectUri: window.location.origin,
  customQueryParams: { audience: 'https://nabarun.resourceserver.api' },
  redirectUri: window.location.origin + '/callback'
}
export const environment = {
  production: false,
  name:'',
  max_idle_time_in_sec: 10,
  api_base_url: 'http://localhost:8082',
  auth_config: authConfig
};


