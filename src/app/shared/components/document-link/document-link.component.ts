import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KeyValue } from '../../model/key-value.model';
import { DocumentCategory } from './document-link.model';

@Component({
  selector: 'app-document-link',
  templateUrl: './document-link.component.html',
  styleUrls: ['./document-link.component.scss']
})
export class DocumentLinkComponent {

  @Input({ required: true })
  categories: DocumentCategory[] = [];

  @Input()
  pageSize: number = 10;

  @Output()
  documentClicked = new EventEmitter<{ doc: KeyValue, categoryName: string }>();

  // Track page per category
  public currentPageMap: { [key: string]: number } = {};

  onDocumentClick(doc: KeyValue, categoryName: string) {
    this.documentClicked.emit({ doc, categoryName });
  }

  getPagedDocuments(category: DocumentCategory): KeyValue[] {
    const page = this.currentPageMap[category.name] || 0;
    const start = page * this.pageSize;
    return category.documents.slice(start, start + this.pageSize);
  }

  onPageChange(categoryName: string, newPage: number) {
    this.currentPageMap[categoryName] = newPage;
  }

  getTotalPages(category: DocumentCategory): number {
    return Math.ceil(category.documents.length / this.pageSize);
  }
}

