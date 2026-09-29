import { Component, HostBinding, Input } from '@angular/core';
import { DmsService } from 'src/app/core/api/api-client/services';
import { openWindow, saveAs } from 'src/app/shared/utils/utilities.service';
import { Doc } from 'src/app/shared/models/document.model';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss'],
    standalone: false
})
export class DocumentListComponent {

  @Input('documents') documents: Doc[] = [];
  @Input('heading') documentHeading: string = 'Documents';
  @Input('showHeading') showHeading: boolean = true;

  @HostBinding('class.document-list--embedded')
  get embedded(): boolean {
    return !this.showHeading;
  }

  canViewAttachment: boolean = true;
  canDeleteAttachment: boolean = false;

  constructor(private dmsApi: DmsService) { }

  deleteAttachment(_document: Doc) {

  }

  downloadAttachment(document: Doc) {
    this.dmsApi.dms2ControllerDownloadDocument({ id: document.id! }).subscribe((response) => {
      saveAs(response, document.fileName!);
    }, error => {
      console.error('Download failed', error);
    });
  }

  viewAttachment(document: Doc) {
    this.dmsApi.dms2ControllerGetSignedUrl({ id: document.id! }).subscribe((data) => {
      openWindow(data.responsePayload!);
    });
  }

}
