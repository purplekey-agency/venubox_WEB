import { Component, OnInit } from '@angular/core';
import { UserIdentityImageType } from '../../../../backend/model/userIdentityImageType';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';

@Component({
  selector: 'app-upload-photo-dialog',
  templateUrl: './upload-photo-dialog.component.html',
  styleUrls: ['./upload-photo-dialog.component.scss'],
})
export class UploadPhotoDialogComponent implements OnInit {
  type = UserIdentityImageType.Brand;
  closeAfterFirstUpload = false;

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef
  ) {}

  ngOnInit(): void {
    if (this.dialogConfig.data.type) {
      this.type = this.dialogConfig.data.type;
    }

    if (this.dialogConfig.data.closeAfterFirstUpload) {
      this.closeAfterFirstUpload = this.dialogConfig.data.closeAfterFirstUpload;
    }
  }

  onAddedFile(e) {
    if (this.closeAfterFirstUpload) {
      this.dialogRef.close(e);
    }
  }
}
