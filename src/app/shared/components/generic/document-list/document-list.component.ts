import { Component, Input } from '@angular/core';
import { DocumentDto } from 'src/app/core/api-client/models';
import { DmsControllerService } from 'src/app/core/api-client/services';
import { openWindow } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent {

  @Input('documents') documents: DocumentDto[] | undefined;
  @Input('heading') documentHeading: string = 'Documents';
  @Input('showHeading') showHeading: boolean = true;

  canViewAttachment: boolean = true;
  canDeleteAttachment: boolean = true;

  constructor(private commonController: DmsControllerService) { }

  deleteAttachment(document: DocumentDto) {

  }

  downloadAttachment(document: DocumentDto) {
    this.commonController.downloadDocument({ id: document.id! }).subscribe(data => {
      // //console.log(data)
      //saveFromURL(data,document.originalFileName)
      //saveAs(data as Blob, document.originalFileName!);
    })
  }

  viewAttachment(document: DocumentDto) {
    this.commonController.viewDocument({ id: document.id! }).subscribe((data) => {
      //console.log(data)
      openWindow(data.responsePayload!);
    })
  }

}
