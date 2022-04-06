import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IdentitiesService } from '../../../../backend/api/identities.service';
import { UserIdentityImageResponseDto } from '../../../../backend/model/userIdentityImageResponseDto';
import { UserIdentityImageType } from '../../../../backend/model/userIdentityImageType';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';

@Component({
  selector: 'app-photo-chooser-dialog',
  templateUrl: './photo-chooser-dialog.component.html',
  styleUrls: ['./photo-chooser-dialog.component.scss'],
})
export class PhotoChooserDialogComponent implements OnInit {
  type = UserIdentityImageType.Brand;
  isLoading = false;
  images: UserIdentityImageResponseDto[] = [];

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    private identitiesService: IdentitiesService
  ) {
    if (this.dialogConfig.data?.type) {
      this.type = this.dialogConfig.data.type;
    }
  }

  ngOnInit() {
    this.isLoading = true;
    this.identitiesService
      .apiIdentitiesGet({
        type: this.type,
      })
      .subscribe(
        (res) => {
          this.images = res;
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }

  close() {
    this.dialogRef.close();
  }

  selectImage(image: UserIdentityImageResponseDto) {
    this.dialogRef.close({ image });
  }
}
