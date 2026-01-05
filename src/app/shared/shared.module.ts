import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemTileListComponent } from './components/generic/item-tile-list/item-tile-list.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MAT_SELECT_SCROLL_STRATEGY, MatSelectModule } from '@angular/material/select';
import { SearchAndAdvancedSearchFormComponent } from './components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentListComponent } from './components/generic/document-list/document-list.component';
import { AccordionListComponent } from './components/generic/accordion-list/accordion-list.component';
import { DetailedViewComponent } from './components/generic/detailed-view/detailed-view.component';
import { FileUploadComponent } from './components/generic/file-upload/file-upload.component';
import { MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule } from '@angular/material/radio';
import { UniversalInputComponent } from './components/generic/universal-input/universal-input.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { ReplaceNullPipe } from './pipes/replace-null.pipe';
import { HtmlSanitizerPipe } from './pipes/html-sanitizer.pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { PlatformModule } from '@angular/cdk/platform';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxMatInputTelComponent } from 'ngx-mat-input-tel';
import { FloatingActionButtonComponent } from './components/floating-action-button/floating-action-button.component';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxModule } from '@angular/material/checkbox';
import { DynamicInjectPipe } from './pipes/dynamic-inject.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AccordionFilterPipe } from './pipes/accordion-filter.pipe';
import { AlertComponent } from './components/generic/alert/alert.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HistoryComponent } from './components/generic/history/history.component';
import { DisplayValueFilterPipe } from './pipes/display-value-filter.pipe';
import { PageNavigationButtonsComponent } from './components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { PageLayoutComponent } from './layout/page-layout/page-layout.component';
import { DocumentLinkComponent } from './components/document-link/document-link.component';
import { AppPhoneNumberComponent } from './components/generic/phone-number/app-phone-number.component';
import { StandardTabGroupComponent } from './components/standard-tab-group/standard-tab-group.component';
import { EditableTableSectionComponent } from './components/generic/detailed-view/editable-table/editable-table-section.component';
import { EditableListSectionComponent } from './components/generic/detailed-view/editable-list/editable-list-section.component';

@NgModule({
  declarations: [
    ItemTileListComponent,
    SearchAndAdvancedSearchFormComponent,
    DocumentListComponent,
    AccordionListComponent,
    DetailedViewComponent,
    FileUploadComponent,
    UniversalInputComponent,
    ProfileCardComponent,
    ProfileViewComponent,
    ReplaceNullPipe,
    HtmlSanitizerPipe,
    DynamicInjectPipe,
    AccordionFilterPipe,
    AlertComponent,
    HistoryComponent,
    DisplayValueFilterPipe,
    PageNavigationButtonsComponent,
    PageLayoutComponent,
    DocumentLinkComponent,
    FloatingActionButtonComponent,
    AppPhoneNumberComponent,
    StandardTabGroupComponent,
    EditableTableSectionComponent,
    EditableListSectionComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatPaginatorModule,
    MatInputModule,
    MatRadioModule,
    AngularEditorModule,
    NgxMatTimepickerModule,
    PlatformModule,
    ClipboardModule,
    MatMenuModule,
    MatButtonToggleModule,
    NgxMatInputTelComponent,
    MatCheckboxModule,
    MatAutocompleteModule,
  ],
  exports: [
    ItemTileListComponent,
    MatTabsModule,
    SearchAndAdvancedSearchFormComponent,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    AccordionListComponent,
    FileUploadComponent,
    MatInputModule,
    ProfileCardComponent,
    ProfileViewComponent,
    ReplaceNullPipe,
    HtmlSanitizerPipe,
    UniversalInputComponent,
    AngularEditorModule,
    PlatformModule,
    ClipboardModule,
    MatMenuModule,
    MatButtonToggleModule,
    DynamicInjectPipe,
    AlertComponent,
    HistoryComponent,
    PageNavigationButtonsComponent,
    PageLayoutComponent,
    MatCheckboxModule,
    DocumentLinkComponent,
    FloatingActionButtonComponent,
    AppPhoneNumberComponent,
    StandardTabGroupComponent,
    DetailedViewComponent
  ],
  providers: [{
    provide: MAT_RADIO_DEFAULT_OPTIONS,
    useValue: { color: 'primary' },
  },
  {
    provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
    useValue: { color: 'primary' },
  },
  {
    provide: MAT_DIALOG_DATA,
    useValue: {}
  },
    // {
    //   provide:MAT_SELECT_SCROLL_STRATEGY,
    //   useValue:{}
    // },
    // {
    //   provide:MatDatepicker,
    //   useValue:{}
    // }
    //MemberSearchPipe,
  ],


})
export class SharedModule { }
