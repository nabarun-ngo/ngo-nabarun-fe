import { Component, Input } from '@angular/core';
import { StaticDocumentDto } from 'src/app/core/api-client/models';

@Component({
  selector: 'app-document-link',
  templateUrl: './document-link.component.html',
  styleUrls: ['./document-link.component.scss']
})
export class DocumentLinkComponent {

  @Input({ required: true })
  categories: StaticDocumentDto[] = [];
}

