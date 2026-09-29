import { NgModule } from '@angular/core';
import { SharedMaterialModule } from './modules/material.module';
import { SharedPipesModule } from './modules/pipes.module';
import { SharedFormsModule } from './modules/forms.module';
import { SharedDocumentsModule } from './modules/documents.module';
import { SharedNavigationModule } from './modules/navigation.module';
import { UniversalListDashboardModule } from '@ssdev-toolkit/angular-list-dashboard';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { HasPermissionDirective } from '@ssdev-toolkit/angular-auth';

/** Compatibility barrel — re-exports shared modules. */
@NgModule({
  imports: [
    SharedNavigationModule,
    UniversalListDashboardModule.forRoot({
      documentListComponent: DocumentListComponent,
      fileUploadComponent: FileUploadComponent,
    }),
    SharedMaterialModule,
    SharedPipesModule,
    SharedFormsModule,
    SharedDocumentsModule,
    HasPermissionDirective,
  ],
  exports: [
    SharedNavigationModule,
    UniversalListDashboardModule,
    SharedMaterialModule,
    SharedPipesModule,
    SharedFormsModule,
    SharedDocumentsModule,
    HasPermissionDirective,
  ],
})
export class SharedModule {}
