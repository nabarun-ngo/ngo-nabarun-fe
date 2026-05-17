import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KeyValue } from '../../model/key-value.model';
import { DocumentCategory, KebabMenuItem } from './document-link.model';

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

  @Input()
  expandedByDefault: boolean = false;

  /**
   * Optional list of kebab menu items to show per document.
   * Each item has a `name` (label) and an `onClick` callback.
   * When empty (default) the kebab button is not rendered.
   */
  @Input()
  kebabMenuItems: KebabMenuItem[] = [];

  @Output()
  documentClicked = new EventEmitter<{ doc: KeyValue, categoryName: string }>();

  @Output()
  categoryOpened = new EventEmitter<DocumentCategory>();

  @Output()
  pageChanged = new EventEmitter<{ category: DocumentCategory, page: number }>();

  // Track page per category
  public currentPageMap: { [key: string]: number } = {};

  get hasKebab(): boolean {
    return this.kebabMenuItems.length > 0;
  }

  onDocumentClick(doc: KeyValue, categoryName: string) {
    this.documentClicked.emit({ doc, categoryName });
  }

  onCategoryOpen(category: DocumentCategory) {
    this.categoryOpened.emit(category);
  }

  onPageChange(category: DocumentCategory, newPage: number) {
    this.currentPageMap[category.name] = newPage;
    this.pageChanged.emit({ category, page: newPage });
  }

  getTotalPages(category: DocumentCategory): number {
    const total = category.totalElements || category.documents.length;
    return Math.ceil(total / this.pageSize);
  }

  onKebabItemClick(item: KebabMenuItem, doc: KeyValue, categoryName: string, event: MouseEvent) {
    event.stopPropagation();
    item.onClick(doc, categoryName);
  }
}

