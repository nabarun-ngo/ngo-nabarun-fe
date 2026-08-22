import { Observable } from 'rxjs';
import type {
  AdminJsonDocument,
  JsonStoreSchemaCatalogItem,
  JsonStoreSchemaResolve,
} from '../domain';

export abstract class JsonStoreDataSource {
  abstract listAll(): Observable<AdminJsonDocument[]>;
  abstract listByNamespace(namespace: string): Observable<AdminJsonDocument[]>;
  abstract getById(id: string): Observable<AdminJsonDocument | undefined>;
  abstract getByKey(namespace: string, key: string): Observable<AdminJsonDocument | undefined>;
  abstract create(input: {
    namespace: string;
    key: string;
    payload: Record<string, unknown>;
  }): Observable<AdminJsonDocument>;
  abstract update(id: string, payload: Record<string, unknown>): Observable<AdminJsonDocument>;
  abstract remove(id: string): Observable<void>;
  abstract resolveSchema(namespace: string, key?: string): Observable<JsonStoreSchemaResolve>;
  abstract listSchemas(): Observable<JsonStoreSchemaCatalogItem[]>;
}
