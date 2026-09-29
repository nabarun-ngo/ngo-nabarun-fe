import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountService as AccountApiService, EarningService as EarningApiService, DmsService } from 'src/app/core/api/api-client/services';
import type { Account } from '../../accounts/domain';
import { mapAccountDtoToAccount } from '../../accounts/data/account-api.mapper';
import type { Earning, PagedEarnings } from '../domain';
import {
  mapToCreateEarning,
  mapToEarning,
  mapToPagedEarnings,
  mapToUpdateEarning,
} from './earning-data.mapper';
import { forkJoin } from 'rxjs';
import { DocumentMappingRequestDto, UploadDocumentRequestDto } from 'src/app/core/api/api-client/models';
import { mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';

@Injectable({
  providedIn: 'root'
})
export class EarningService {
  constructor(
    private earningApi: EarningApiService,
    private accountApi: AccountApiService,
    private dmsApi: DmsService
  ) { }

  fetchEarnings(
    pageNumber: number = 0,
    pageSize: number = 10,
    filter?: any
  ): Observable<PagedEarnings> {
    const params: any = {
      pageIndex: pageNumber,
      pageSize: pageSize,
      ...filter
    };
    return this.earningApi.earningControllerListEarnings(params).pipe(
      map(response => {
        const payload = response.responsePayload!;
        return mapToPagedEarnings({
          content: payload.items,
          totalElements: payload.total,
          pageIndex: payload.pageIndex,
          pageSize: payload.pageSize,
        } as any);
      })
    );
  }

  createEarning(data: any): Observable<Earning> {
    const request = mapToCreateEarning(data);
    return this.earningApi.earningControllerCreateEarning({ body: request }).pipe(
      map(response => mapToEarning(response.responsePayload!))
    );
  }

  updateEarning(id: string, data: any): Observable<Earning> {
    const request = mapToUpdateEarning(data);
    return this.earningApi.earningControllerUpdateEarning({ id: id, body: request }).pipe(
      map(response => mapToEarning(response.responsePayload!))
    );
  }

  getEarningReferenceData(): Observable<any> {
    return this.earningApi.earningControllerGetEarningReferenceData().pipe(
      map(response => response.responsePayload)
    );
  }

  fetchPayableAccounts(purpose: 'EARNING_INTEREST' | 'DONATION' = 'EARNING_INTEREST'): Observable<Account[]> {
    return this.accountApi.accountControllerPayableAccount({ purpose }).pipe(
      map(res => res.responsePayload),
      map(accounts => (accounts ?? []).map(mapAccountDtoToAccount))
    );
  }

  getEarningDocuments(id: string) {
    return this.dmsApi
      .dms2ControllerListDocuments({ entityType: 'EARNING', entityId: id })
      .pipe(map((d) => d.responsePayload?.data ?? []), map(d => d.map(mapDocDtoToDoc)));
  }

  getEarningById(id: string): Observable<Earning> {
    return this.earningApi.earningControllerGetEarningById({ id }).pipe(
      map((response) => mapToEarning(response.responsePayload!)),
    );
  }

  uploadDocuments(documents: FileUpload[], earning: Earning) {
    const mappings: DocumentMappingRequestDto[] = [];
    if (earning.transactionId) {
      mappings.push({
        entityId: earning.transactionId,
        entityType: 'TRANSACTION'
      });
    }
    const requests = documents.map(doc => {
      const body: UploadDocumentRequestDto = {
        fileName: doc.detail.originalFileName,
        fileBase64: doc.detail.base64Content,
        contentType: doc.detail.contentType,
        mappings: [
          {
            entityId: earning.id,
            entityType: 'EARNING'
          },
          ...mappings
        ]
      };
      return this.dmsApi.dms2ControllerUploadDocument({ body }).pipe(map(d => d.responsePayload));
    });
    return forkJoin(requests);
  }
}
