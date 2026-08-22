export type AdminApiKeyStatus = 'active' | 'expired';

export interface AdminApiKey {
  id: string;
  name: string;
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
  status: AdminApiKeyStatus;
}

export interface ApiKeyContext {
  scopes: string[];
}
