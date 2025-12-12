import { Component, Input } from '@angular/core';
import { DocumentDetail } from 'src/app/core/api/models';
import { CommonControllerService } from 'src/app/core/api/services';
import { openWindow, saveAs, saveFromURL } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent {

  @Input('documents') documents: DocumentDetail[] | undefined;
  @Input('heading') documentHeading: string = 'Documents';
  @Input('showHeading') showHeading: boolean = true;

  canViewAttachment: boolean = true;
  canDeleteAttachment: boolean = true;

  constructor(private commonController: CommonControllerService) { }

  deleteAttachment(document: DocumentDetail) {

  }

  downloadAttachment(document: DocumentDetail) {
    this.commonController.downloadDocument({ id: document.docId! }).subscribe(data => {
      // //console.log(data)
      //saveFromURL(data,document.originalFileName)
      saveAs(data as Blob, document.originalFileName!);
    })
  }

  viewAttachment(document: DocumentDetail) {
    this.commonController.viewDocument({ id: document.docId! }).subscribe((data) => {
      //console.log(data)
      openWindow(data.responsePayload?.downloadURL!);
    })
  }

}
