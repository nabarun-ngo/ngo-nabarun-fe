import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from './material.module';
import { DocumentListComponent } from '../components/document-list/document-list.component';

@NgModule({
  declarations: [
    DocumentListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedMaterialModule,
  ],
  exports: [
    DocumentListComponent,
  ],
})
export class SharedDocumentsModule {}
