export interface AdminJsonDocument {
  id: string;
  key: string;
  namespace: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type JsonStoreSchemaGroup = 'reference' | 'content' | 'managed';
export type JsonStoreSchemaMatch = 'exact' | 'namespace' | 'none';

export interface JsonStoreSchemaResolve {
  namespace: string;
  key?: string;
  match: JsonStoreSchemaMatch;
  jsonSchema: Record<string, unknown> | null;
}

export interface JsonStoreSchemaCatalogItem {
  registryKey: string;
  namespace: string;
  key?: string;
  group: JsonStoreSchemaGroup;
  label: string;
  managedLink?: string;
  consumerHint?: string;
  hasSchema: boolean;
}

export interface JsonStorePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface ValidationIssue {
  path: string;
  message: string;
  line?: number;
}

export interface DraftValidationState {
  parseOk: boolean;
  parseError?: string;
  parseLine?: number;
  schemaOk: boolean;
  schemaIssues: ValidationIssue[];
  /** True when dirty, parseable, and schema-ok (or no schema). */
  canSave: boolean;
}

export type EditorTab = 'json' | 'tree' | 'diff' | 'info';
