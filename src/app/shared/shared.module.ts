import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemTileListComponent } from './components/generic/item-tile-list/item-tile-list.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { PageNavigationButtonsComponent } from './components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchFormComponent } from './components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentListComponent } from './components/generic/document-list/document-list.component';
import { ExpandableTableComponent } from './components/generic/expandable-table/expandable-table.component';
import { AccordionListComponent } from './components/generic/accordion-list/accordion-list.component';
import { DetailedViewComponent } from './components/generic/detailed-view/detailed-view.component';
import { DetailedProfileComponent } from './components/detailed-profile/detailed-profile.component';
import { DetailedDonationComponent } from './components/detailed-donation/detailed-donation.component';
import { SegmentedControllerComponent } from './components/generic/segmented-controller/segmented-controller.component';
import { ControlSegmentComponent } from './components/generic/segmented-controller/control-segment.component';
import { FileUploadComponent } from './components/generic/file-upload/file-upload.component';
import {MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule} from '@angular/material/radio';
import { UniversalInputComponent } from './components/generic/universal-input/universal-input.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { ProfileViewComponent } from './components/profile-view/profile-view.component';
import { ReplaceNullPipe } from './pipes/replace-null.pipe';
import { HtmlSanitizerPipe } from './pipes/html-sanitizer.pipe';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';

@NgModule({
  declarations: [
    ItemTileListComponent,
    PageNavigationButtonsComponent,
    SearchAndAdvancedSearchFormComponent,
    DetailedDonationComponent,
    DetailedProfileComponent,
    DocumentListComponent,
    ExpandableTableComponent,
    AccordionListComponent,
    DetailedViewComponent,
    SegmentedControllerComponent,
    ControlSegmentComponent,
    FileUploadComponent,
    UniversalInputComponent,
    ProfileCardComponent,
    ProfileViewComponent,
    ReplaceNullPipe,
    HtmlSanitizerPipe,
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
    MatTableModule, MatButtonModule,  MatIconModule,
    MatPaginatorModule,
    MatInputModule,
    MatRadioModule,
    AngularEditorModule,
    NgxMatTimepickerModule,
  ],
  exports: [
    ItemTileListComponent,
    MatTabsModule,
    PageNavigationButtonsComponent,
    SearchAndAdvancedSearchFormComponent,
    MatCardModule,
    MatExpansionModule,
    MatTableModule, 
    MatButtonModule,  
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    ExpandableTableComponent,
    AccordionListComponent,
    DetailedDonationComponent,
    DetailedProfileComponent,
    SegmentedControllerComponent,
    ControlSegmentComponent,
    FileUploadComponent,
    MatInputModule,
    ProfileCardComponent,
    ProfileViewComponent,
    ReplaceNullPipe,
    HtmlSanitizerPipe,
    UniversalInputComponent,
    AngularEditorModule
  ],
  providers: [{
    provide: MAT_RADIO_DEFAULT_OPTIONS,
    useValue: { color: 'primary' },
}]
})
export class SharedModule { }
