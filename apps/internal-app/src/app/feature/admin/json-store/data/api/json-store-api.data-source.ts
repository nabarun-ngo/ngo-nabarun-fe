import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiConfiguration } from 'src/app/core/api/api-client/api-configuration';
import { JsonStoreService } from 'src/app/core/api/api-client/services';
import type {
  AdminJsonDocument,
  JsonStoreSchemaCatalogItem,
  JsonStoreSchemaResolve,
} from '../../domain';
import { JsonStoreDataSource } from '../json-store-data.source';

interface Envelope<T> {
  responsePayload?: T;
}

function mapDoc(dto: {
  id: string;
  key: string;
  namespace: string;
  payload: {};
  createdAt: string;
  updatedAt: string;
}): AdminJsonDocument {
  return {
    id: dto.id,
    key: dto.key,
    namespace: dto.namespace,
    payload: (dto.payload ?? {}) as Record<string, unknown>,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

@Injectable()
export class JsonStoreApiDataSource extends JsonStoreDataSource {
  private readonly api = inject(JsonStoreService);
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);

  private get rootUrl(): string {
    return this.config.rootUrl.replace(/\/$/, '');
  }

  listAll(): Observable<AdminJsonDocument[]> {
    return this.api.jsonDocumentControllerList().pipe(
      map(r => (r.responsePayload ?? []).map(mapDoc)),
    );
  }

  listByNamespace(namespace: string): Observable<AdminJsonDocument[]> {
    return this.api.jsonDocumentControllerList({ namespace }).pipe(
      map(r => (r.responsePayload ?? []).map(mapDoc)),
    );
  }

  getById(id: string): Observable<AdminJsonDocument | undefined> {
    return this.api.jsonDocumentControllerGetById({ id }).pipe(
      map(r => (r.responsePayload ? mapDoc(r.responsePayload) : undefined)),
    );
  }

  getByKey(namespace: string, key: string): Observable<AdminJsonDocument | undefined> {
    return this.api.jsonDocumentControllerGetByKey({ namespace, key }).pipe(
      map(r => (r.responsePayload ? mapDoc(r.responsePayload) : undefined)),
    );
  }

  create(input: {
    namespace: string;
    key: string;
    payload: Record<string, unknown>;
  }): Observable<AdminJsonDocument> {
    return this.api.jsonDocumentControllerCreate({
      body: {
        namespace: input.namespace,
        key: input.key,
        payload: input.payload,
      },
    }).pipe(map(r => mapDoc(r.responsePayload!)));
  }

  update(id: string, payload: Record<string, unknown>): Observable<AdminJsonDocument> {
    return this.api.jsonDocumentControllerUpdate({
      id,
      body: { payload },
    }).pipe(map(r => mapDoc(r.responsePayload!)));
  }

  remove(id: string): Observable<void> {
    return this.api.jsonDocumentControllerDelete({ id }).pipe(map(() => undefined));
  }

  resolveSchema(namespace: string, key?: string): Observable<JsonStoreSchemaResolve> {
    let params = new HttpParams().set('namespace', namespace);
    if (key) params = params.set('key', key);
    return this.http
      .get<Envelope<JsonStoreSchemaResolve>>(`${this.rootUrl}/api/json-store/schema`, { params })
      .pipe(
        map(r => r.responsePayload ?? {
          namespace,
          key,
          match: 'none' as const,
          jsonSchema: null,
        }),
      );
  }

  listSchemas(): Observable<JsonStoreSchemaCatalogItem[]> {
    return this.http
      .get<Envelope<JsonStoreSchemaCatalogItem[]>>(`${this.rootUrl}/api/json-store/schemas`)
      .pipe(map(r => r.responsePayload ?? []));
  }
}
