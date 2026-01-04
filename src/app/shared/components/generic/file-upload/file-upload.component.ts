import { Component, EventEmitter, Input, Output } from '@angular/core';
import { sanitizeBase64 } from 'src/app/core/service/utilities.service';

export type FileUpload = { file: File, detail: { base64Content: string, contentType: string, originalFileName: string } };
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  protected fileError!: string;
  @Input() minFileSize: number = 10 * 1024;//Default 10Kb
  @Input() maxFileSize: number = 1 * 1024 * 1024;//Default 1MB
  @Input() allowedFileTypes: string[] = [];
  private fileTypwRegex = new RegExp(this.allowedFileTypes.join("|"), "i");
  protected selectedFiles: FileUpload[] = [];
  @Output() files: EventEmitter<FileUpload[]> = new EventEmitter();


  protected onSelectFile(event: any) {
    let files = event.target.files as FileList;
    ////console.log(files[0])

    if (files.length > 0) {
      let fileExt = files[0].name.split('.').pop()!;
      //console.log(fileExt, this.fileTypwRegex.test(fileExt))

      if (this.allowedFileTypes.length > 0 && !this.fileTypwRegex.test(fileExt)) {
        this.fileError = 'File type ' + fileExt + ' not allowed.';
      } else if (files[0].size < this.minFileSize) {
        this.fileError = 'File size must be greter than ' + this.getSizeText(this.minFileSize) + '.';
      } else if (files[0].size > this.maxFileSize) {
        this.fileError = 'File size must be less than ' + this.getSizeText(this.maxFileSize) + '.';
        ////console.log('hiii')
        return;
      } else {

        this.fileError = '';
        let reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = () => {
          this.selectedFiles.push({
            file: files[0],
            detail: {
              base64Content: sanitizeBase64(reader.result as string),
              contentType: files[0].type,
              originalFileName: files[0].name
            }
          });
          this.files.emit(this.selectedFiles);
          //console.log(this.selectedFiles)
        }
      }
    }
  }

  getSelectedFiles() {
    return this.selectedFiles;
  }
  protected removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    //this.files.emit(this.selectedFiles);
  }

  protected getSizeText(size: number) {
    return size > 1024
      ? size >= 1024 * 1024
        ? Math.round(size / 1048576) + " MB"
        : Math.round(size / 1024) + " KB"
      : size + " B";
  }


}
