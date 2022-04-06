import { HttpEventType } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IdentitiesService } from '../../../backend/api/identities.service';

interface AddedFile {
  id?: number;
  file: any;
  previewBase64: string | ArrayBuffer;
  uploadProgress: number;
  subscription?: Subscription;
}

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent implements AfterViewInit {
  @ViewChild('container') containerElement: ElementRef;
  @Output() uploadedPhotoFile = new EventEmitter();
  @Input() elementid = 'dropContainer';
  @Input() type;
  addedFileList: AddedFile[] = [];

  constructor(private identitiesService: IdentitiesService) {}

  ngAfterViewInit(): void {
    var photo;

    var dropContainer = this.containerElement.nativeElement;

    dropContainer.ondragover = dropContainer.ondragenter = function (evt) {
      if (!dropContainer.classList.contains('hovered')) {
        dropContainer.className += ' hovered';
      }
      evt.preventDefault();
    };

    dropContainer.ondragleave = dropContainer.ondragend = dropContainer.ondragend = function (
      evt
    ) {
      dropContainer.classList.remove('hovered');
      evt.preventDefault();
    };

    dropContainer.ondrop = (evt) => {
      evt.preventDefault();

      for (let i = 0; i < evt.dataTransfer.files.length; i++) {
        const file = evt.dataTransfer.files[i];

        this.onAddFile(file);
      }
    };
  }

  uploadFile(e) {
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];

      this.onAddFile(file);
    }
  }

  onAddFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.addedFileList.push({
        file,
        previewBase64: reader.result,
        uploadProgress: 0,
      });
      this.startUpload(file);
    };

    reader.readAsDataURL(file);
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  startUpload(file) {
    const item = this.addedFileList.find((x) => x.file === file);

    item.subscription = this.identitiesService
      .apiIdentitiesPost({ file, type: this.type }, 'events', true)
      .subscribe((event) => {
        switch (event.type) {
          case HttpEventType.Sent:
            //console.log('Request has been made!');
            break;
          case HttpEventType.UploadProgress:
            const progress = Math.round((event.loaded / event.total) * 100);
            if (progress >= 99) {
              item.uploadProgress = 99;
            } else {
              item.uploadProgress = progress;
            }
            //console.log(`Uploaded! ${progress}%`);
            break;
          case HttpEventType.Response:
            item.uploadProgress = 100;
            item.id = event.body.id;

            this.uploadedPhotoFile.emit(event.body);
        }
      });
  }

  cancelUpload(file: AddedFile) {
    const item = this.addedFileList.find((x) => x.file === file.file);

    if (item) {
      item.subscription.unsubscribe();
      this.removeFile(file);
    }
  }

  removeFile(file: AddedFile) {
    const itemIndex = this.addedFileList.findIndex((x) => x.file === file.file);

    if (itemIndex !== -1) {
      if (file.id) {
        this.identitiesService
          .apiIdentitiesDelete({ id: file.id })
          .subscribe((res) => {
            this.addedFileList.splice(itemIndex, 1);
          });
      } else {
        this.addedFileList.splice(itemIndex, 1);
      }
    }
  }
}
