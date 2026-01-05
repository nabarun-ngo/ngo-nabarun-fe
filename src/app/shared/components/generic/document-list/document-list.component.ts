import { Component, Input } from '@angular/core';
import { DmsControllerService } from 'src/app/core/api-client/services';
import { openWindow } from 'src/app/core/service/utilities.service';
import { Doc } from 'src/app/shared/model/document.model';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent {

  @Input('documents') documents: Doc[] | undefined;
  @Input('heading') documentHeading: string = 'Documents';
  @Input('showHeading') showHeading: boolean = true;

  canViewAttachment: boolean = true;
  canDeleteAttachment: boolean = true;

  constructor(private commonController: DmsControllerService) { }

  deleteAttachment(document: Doc) {

  }

  downloadAttachment(document: Doc) {
    this.commonController.downloadDocument({ id: document.id! }).subscribe(data => {
      // ////console.log(data)
      //saveFromURL(data,document.originalFileName)
      //saveAs(data as Blob, document.originalFileName!);
    })
  }

  viewAttachment(document: Doc) {
    this.commonController.viewDocument({ id: document.id! }).subscribe((data) => {
      ////console.log(data)
      openWindow(data.responsePayload!);
    })
  }

}
