import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { ApiConfiguration } from 'src/app/core/api/api-client/api-configuration';
import {
  ProjectService as ProjectApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import { ExpenseService } from 'src/app/feature/finance/expense/data/expense.service';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import type {
  Asset,
  AssetCategory,
  AssetCustodyRecord,
  AssetStatus,
  PagedAssets,
} from '../domain';

interface SuccessResponse<T> {
  responsePayload?: T;
}

interface AssetCustodyRecordDto {
  id: string;
  custodianUserId: string;
  assignedAt: string;
  assignedById?: string;
  returnedAt?: string;
  returnedById?: string;
  notes?: string;
}

interface AssetDetailDto {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  location?: string;
  status: AssetStatus;
  custodianUserId?: string;
  projectId?: string;
  expenseId?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  currency?: string;
  currentValue?: number;
  depreciationMethodNotes?: string;
  maintenanceNotes?: string;
  createdById?: string;
  updatedById?: string;
  custodyHistory?: AssetCustodyRecordDto[];
  createdAt: string;
  updatedAt: string;
}

interface AssetListResponseDto {
  items: AssetDetailDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

/** Thin transport wrapper over `/api/assets` until OpenAPI client includes AssetService. */
@Injectable({ providedIn: 'root' })
export class AssetService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ApiConfiguration,
    private readonly projectApi: ProjectApiService,
    private readonly usersApi: UsersService,
    private readonly expenseService: ExpenseService,
  ) {}

  listAssets(options: {
    pageIndex: number;
    pageSize: number;
    status?: AssetStatus;
    category?: AssetCategory;
    custodianUserId?: string;
    projectId?: string;
  }): Observable<PagedAssets> {
    let params = new HttpParams()
      .set('pageIndex', String(options.pageIndex))
      .set('pageSize', String(options.pageSize));

    if (options.status) {
      params = params.set('status', options.status);
    }
    if (options.category) {
      params = params.set('category', options.category);
    }
    if (options.custodianUserId) {
      params = params.set('custodianUserId', options.custodianUserId);
    }
    if (options.projectId) {
      params = params.set('projectId', options.projectId);
    }

    return this.http
      .get<SuccessResponse<AssetListResponseDto>>(`${this.config.rootUrl}/api/assets/list`, { params })
      .pipe(
        map(response => {
          const payload = response.responsePayload ?? { items: [], total: 0, pageIndex: 0, pageSize: 0 };
          return {
            content: (payload.items ?? []).map(mapAssetDto),
            totalSize: payload.total ?? 0,
            pageIndex: payload.pageIndex ?? options.pageIndex,
            pageSize: payload.pageSize ?? options.pageSize,
          };
        }),
      );
  }

  fetchAssetById(id: string): Observable<Asset | undefined> {
    return this.http
      .get<SuccessResponse<AssetDetailDto>>(`${this.config.rootUrl}/api/assets/${encodeURIComponent(id)}`)
      .pipe(
        map(response => {
          const payload = response.responsePayload;
          return payload ? mapAssetDto(payload) : undefined;
        }),
      );
  }

  createAsset(data: Partial<Asset>): Observable<Asset> {
    return this.http
      .post<SuccessResponse<AssetDetailDto>>(`${this.config.rootUrl}/api/assets/create`, toCreateBody(data))
      .pipe(map(response => mapAssetDto(response.responsePayload!)));
  }

  updateAsset(id: string, patch: Partial<Asset>): Observable<Asset> {
    return this.http
      .put<SuccessResponse<AssetDetailDto>>(
        `${this.config.rootUrl}/api/assets/update/${encodeURIComponent(id)}`,
        toUpdateBody(patch),
      )
      .pipe(map(response => mapAssetDto(response.responsePayload!)));
  }

  deleteAsset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.rootUrl}/api/assets/${encodeURIComponent(id)}`);
  }

  assignCustody(id: string, custodianUserId: string, notes?: string): Observable<Asset> {
    return this.http
      .post<SuccessResponse<AssetDetailDto>>(
        `${this.config.rootUrl}/api/assets/${encodeURIComponent(id)}/assign`,
        { custodianUserId, notes },
      )
      .pipe(map(response => mapAssetDto(response.responsePayload!)));
  }

  returnCustody(id: string, notes?: string): Observable<Asset> {
    return this.http
      .post<SuccessResponse<AssetDetailDto>>(
        `${this.config.rootUrl}/api/assets/${encodeURIComponent(id)}/return`,
        { notes },
      )
      .pipe(map(response => mapAssetDto(response.responsePayload!)));
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.projectApi.projectControllerListProjects({
      pageIndex: 0,
      pageSize: 100,
    }).pipe(
      map(response => (response.responsePayload?.items ?? []).map(project => ({
        key: project.id,
        label: `${project.code} · ${project.name}`,
      }))),
    );
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.usersApi.userControllerListUsers({ status: 'ACTIVE' }).pipe(
      map(response => mapPagedUserDtoToPagedUser(response.responsePayload!)),
      map(page => (page.content ?? [])
        .filter(user => !!user.id)
        .map(user => ({
          key: user.id!,
          label: user.fullName?.trim() || user.email?.trim() || user.id!,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))),
    );
  }

  fetchExpenseOptions(): Observable<FieldOption[]> {
    return this.expenseService.fetchExpenses(0, 100).pipe(
      map(page => (page.content ?? [])
        .filter(expense => !!expense.id)
        .map(expense => ({
          key: expense.id!,
          label: expenseLabel(expense),
        }))),
      catchError(() => of([])),
    );
  }
}

function expenseLabel(expense: {
  id?: string;
  name?: string;
  finalAmount?: number;
}): string {
  const name = expense.name?.trim();
  const amount = expense.finalAmount != null
    ? ` · ${expense.finalAmount.toLocaleString('en-IN')}`
    : '';
  return name ? `${name}${amount}` : `${expense.id}${amount}`;
}

function mapCustodyRecord(dto: AssetCustodyRecordDto): AssetCustodyRecord {
  return {
    id: dto.id,
    custodianUserId: dto.custodianUserId,
    assignedAt: dto.assignedAt,
    assignedById: dto.assignedById,
    returnedAt: dto.returnedAt,
    returnedById: dto.returnedById,
    notes: dto.notes,
  };
}

function mapAssetDto(dto: AssetDetailDto): Asset {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    serialNumber: dto.serialNumber,
    location: dto.location,
    status: dto.status,
    custodianUserId: dto.custodianUserId,
    projectId: dto.projectId,
    expenseId: dto.expenseId,
    purchaseDate: dto.purchaseDate,
    purchaseCost: dto.purchaseCost,
    currency: dto.currency,
    currentValue: dto.currentValue,
    depreciationMethodNotes: dto.depreciationMethodNotes,
    maintenanceNotes: dto.maintenanceNotes,
    createdById: dto.createdById,
    updatedById: dto.updatedById,
    custodyHistory: dto.custodyHistory?.map(mapCustodyRecord),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toCreateBody(data: Partial<Asset>): Record<string, unknown> {
  return {
    name: data.name,
    category: data.category,
    serialNumber: data.serialNumber,
    location: data.location,
    status: data.status ?? 'AVAILABLE',
    projectId: data.projectId,
    expenseId: data.expenseId,
    purchaseDate: normalizeDate(data.purchaseDate),
    purchaseCost: data.purchaseCost,
    currentValue: data.currentValue,
    currency: data.currency,
    depreciationMethodNotes: data.depreciationMethodNotes,
    maintenanceNotes: data.maintenanceNotes,
  };
}

function toUpdateBody(patch: Partial<Asset>): Record<string, unknown> {
  return {
    ...(patch.name != null ? { name: patch.name } : {}),
    ...(patch.category != null ? { category: patch.category } : {}),
    ...(patch.serialNumber != null ? { serialNumber: patch.serialNumber } : {}),
    ...(patch.location != null ? { location: patch.location } : {}),
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.projectId != null ? { projectId: patch.projectId } : {}),
    ...(patch.expenseId != null ? { expenseId: patch.expenseId } : {}),
    ...(patch.purchaseDate != null ? { purchaseDate: normalizeDate(patch.purchaseDate) } : {}),
    ...(patch.purchaseCost != null ? { purchaseCost: patch.purchaseCost } : {}),
    ...(patch.currentValue != null ? { currentValue: patch.currentValue } : {}),
    ...(patch.currency != null ? { currency: patch.currency } : {}),
    ...(patch.depreciationMethodNotes != null
      ? { depreciationMethodNotes: patch.depreciationMethodNotes }
      : {}),
    ...(patch.maintenanceNotes != null ? { maintenanceNotes: patch.maintenanceNotes } : {}),
  };
}

function normalizeDate(value: string | Date | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.includes('T') ? value.slice(0, 10) : value;
}
