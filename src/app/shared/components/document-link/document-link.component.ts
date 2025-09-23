import { Component, Input } from '@angular/core';
import { LinkCategoryDetail } from 'src/app/core/api/models';

@Component({
  selector: 'app-document-link',
  templateUrl: './document-link.component.html',
  styleUrls: ['./document-link.component.scss']
})
export class DocumentLinkComponent {

  @Input({required:true})
  categories: LinkCategoryDetail[] =[];
}

