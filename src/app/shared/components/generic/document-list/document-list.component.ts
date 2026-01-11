import { Component, Input } from '@angular/core';
import { DmsControllerService } from 'src/app/core/api-client/services';
import { openWindow, saveAs } from 'src/app/core/service/utilities.service';
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

  constructor(private dmsService: DmsControllerService) { }

  deleteAttachment(document: Doc) {

  }


  downloadAttachment(document: Doc) {
    this.dmsService.downloadDocument({ id: document.id! }).subscribe((response) => {
      const blob = response;

      // 2. Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob!);

      // 3. Create a hidden <a> tag and click it
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName!;
      window.document.body.appendChild(link);
      link.click();

      // 4. Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Download failed', error);
    });
  }


  viewAttachment(document: Doc) {
    this.dmsService.viewDocument({ id: document.id! }).subscribe((data) => {
      openWindow(data.responsePayload!);
    })
  }

}
