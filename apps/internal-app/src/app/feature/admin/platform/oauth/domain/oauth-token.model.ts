export interface AdminOAuthAccount {
  id: string;
  email: string;
  name?: string;
  pictureUrl?: string;
}

export interface AdminOAuthToken {
  id: string;
  accountId: string;
  clientId: string;
  provider: string;
  email: string;
  account?: AdminOAuthAccount;
  expiresAt?: string;
  scopes: string[];
  tokenType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthAuthorizationStarted {
  provider: string;
  initiatedAt: string;
}

/** Result of probing a stored OAuth connection (never includes raw tokens). */
export interface OAuthConnectionTestResult {
  ok: boolean;
  tokenId: string;
  provider: string;
  email: string;
  refreshed: boolean;
  expiresAt?: string;
  accountName?: string;
  message: string;
}

/** Sheet/search criteria for the OAuth connections list. */
export interface OAuthTokenListCriteria {
  /** Connected account id passed to the token-list `account` query param. */
  account?: string;
  /** Display label for the applied Account filter pill. */
  accountLabel?: string;
  [key: string]: unknown;
}
