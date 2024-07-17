import { Injectable } from '@angular/core';
import { NoticeControllerService } from 'src/app/core/api/services';
import { NoticeDefaultValue } from './notice.const';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  defaultValue=NoticeDefaultValue;

  constructor(private noticeController:NoticeControllerService) { }

  retrieveNotices(){
    return this.noticeController.getAllNotice({
      pageIndex:this.defaultValue.pageNumber,
      pageSize:this.defaultValue.pageSize,
    }).pipe(map(d=>d.responsePayload))
  }
}
