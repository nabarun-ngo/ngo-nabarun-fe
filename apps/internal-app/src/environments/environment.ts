
import { AuthConfig } from "@auth0/auth0-angular";
import * as env from "./env.generated";
import json from '../../package.json'

const version: string = json.version;

/**
 * Local auth bypass: guards allow navigation without Auth0; core dev-mode
 * layer supplies demo RBAC / identity. Does not select mock feature data.
 * Toggle via .env: NG_APP_BYPASS_AUTH=true
 * Never enable in stage or production builds.
 */
const envRecord = env as Record<string, unknown>;
export const BYPASS_AUTH = envRecord['NG_APP_BYPASS_AUTH'] === true
  || envRecord['NG_APP_ENABLE_AUTH_BYPASS'] === true;

/**
 * Local mock data: feature providers bind demo data sources instead of API.
 * Independent of BYPASS_AUTH — toggle via .env: NG_APP_MOCK_DATA=true
 * Never enable in stage or production builds.
 */
export const MOCK_DATA = envRecord['NG_APP_MOCK_DATA'] === true;

const apiBaseUrl = env.NG_APP_API_BASE_URL.replace(/\/$/, '');

const auth_config: AuthConfig = {
  domain: env.NG_APP_AUTH0_DOMAIN,
  clientId: env.NG_APP_AUTH0_CLIENT_ID,
  useRefreshTokens: true,
  authorizationParams: {
    redirect_uri: window.location.origin,
    scope: 'openid profile email offline_access api auth_time family_name given_name email_verified exp phone_number picture sub iss iat aud',
    audience: env.NG_APP_AUTH0_AUDIENCE,
  },
  httpInterceptor: {
    allowedList: [{
      uriMatcher(uri) {
        return uri.startsWith(apiBaseUrl);
      },
    }]
  },
}

export const environment = {
  env_name: env.NG_APP_NODE_ENV,
  production: env.NG_APP_PRODUCTION,
  registerServiceWorker: env.NG_APP_REGISTER_SERVICE_WORKER,
  bypassAuth: BYPASS_AUTH,
  mockData: MOCK_DATA,
  name: `Nabarun NGO ${version}`,
  max_idle_time_in_sec: env.NG_APP_MAX_IDLE_TIME_IN_SEC,
  api_base_url: apiBaseUrl,
  inactivityTimeOut: env.NG_APP_INACTIVITY_TIMEOUT_SEC,
  auth_config: auth_config,
  onesignal_app_id: env.NG_APP_ONESIGNAL_APP_ID,
};
