import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { KeyValue } from '../../model/key-value.model';
import { DocumentCategory, KebabMenuItem } from './document-link.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { fuzzySearch } from '../../utils/fuzzy-search';

@Component({
  selector: 'app-document-link',
  templateUrl: './document-link.component.html',
  styleUrls: ['./document-link.component.scss']
})
export class DocumentLinkComponent implements OnInit, OnChanges {
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

  @Output()
  hasResults = new EventEmitter<boolean>();

  // Track page per category
  public currentPageMap: { [key: string]: number } = {};

  _filteredCategories: DocumentCategory[] = [];
  searchValue: string = '';

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.sharedDataService.searchValue.subscribe((value) => {
      this.searchValue = value || '';
      this.computeFilteredCategories();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categories']) {
      this.computeFilteredCategories();
    }
  }

  computeFilteredCategories() {
    if (!this.searchValue) {
      this._filteredCategories = this.categories;
      return;
    }
    const query = this.searchValue;
    this._filteredCategories = this.categories.map(category => {
      const filteredDocs = category.documents.filter(doc => 
        (doc.description && fuzzySearch(doc.description, query)) ||
        (doc.key && fuzzySearch(doc.key, query)) ||
        (doc.displayValue && fuzzySearch(doc.displayValue, query))
      );

      const categoryMatches = fuzzySearch(category.name, query);

      if (categoryMatches || filteredDocs.length > 0) {
        return {
          ...category,
          documents: filteredDocs.length > 0 ? filteredDocs : category.documents,
          isExpanded: categoryMatches || filteredDocs.length > 0 ? true : category.isExpanded
        };
      }
      return null;
    }).filter(cat => cat !== null) as DocumentCategory[];
    this.hasResults.emit(this._filteredCategories.length > 0);
  }

  get filteredCategories(): DocumentCategory[] {
    return this._filteredCategories;
  }

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

