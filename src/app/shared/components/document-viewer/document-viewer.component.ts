import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DocumentViewerData {
  url: string;
  title: string;
}

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss']
})
export class DocumentViewerComponent {
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<DocumentViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentViewerData
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  openInNewTab(): void {
    window.open(this.data.url, '_blank');
  }
}
