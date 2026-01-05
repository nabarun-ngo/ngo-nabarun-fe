import { Pipe, PipeTransform } from '@angular/core';
import { NoticeDetail } from 'src/app/core/api-client/models';

@Pipe({
  name: 'noticeSearch'
})
export class NoticeSearchPipe implements PipeTransform {

  transform(notices: NoticeDetail[] | undefined, searchValue: string): NoticeDetail[] {
    ////console.log(notices,searchValue)
    if (!notices) {
      return [];
    }
    if (!searchValue) {
      return notices;
    }
    //////console.log(searchValue)
    searchValue = searchValue.toLowerCase();
    return notices.filter((notice: NoticeDetail) =>

      (notice.id != null && notice.id.toLowerCase().includes(searchValue))
      ||
      (notice.title != null && notice.title.toLowerCase().includes(searchValue))
      ||
      (notice.description != null && notice.description.toLowerCase().includes(searchValue))

    );
  }

}
