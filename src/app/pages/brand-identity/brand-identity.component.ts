import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IdentitiesService } from '../../backend/api/identities.service';
import { UserIdentityImageResponseDto } from '../../backend/model/userIdentityImageResponseDto';
import { UserIdentityImageType } from '../../backend/model/userIdentityImageType';
import { DialogService } from '../../core/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { UploadPhotoDialogComponent } from '../../shared/components/dialogs/upload-photo-dialog/upload-photo-dialog.component';

@Component({
  selector: 'app-brand-identity',
  templateUrl: './brand-identity.component.html',
  styleUrls: ['./brand-identity.component.scss'],
})
export class BrandIdentityComponent implements OnInit {
  UserIdentityImageType = UserIdentityImageType;
  brandIdentityIcons: UserIdentityImageResponseDto[] = [];
  chatContactIcons: UserIdentityImageResponseDto[] = [];

  brandIdentityIconsLoading = false;
  chatContactIconsLoading = false;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private identitiesService: IdentitiesService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.brandIdentityIconsLoading = true;
    this.identitiesService
      .apiIdentitiesGet({
        type: UserIdentityImageType.Brand,
      })
      .subscribe(
        (res) => {
          this.brandIdentityIcons = res;
          this.brandIdentityIconsLoading = false;
        },
        (err) => {
          this.brandIdentityIconsLoading = false;
        }
      );

    this.chatContactIconsLoading = true;
    this.identitiesService
      .apiIdentitiesGet({
        type: UserIdentityImageType.Contact,
      })
      .subscribe(
        (res) => {
          this.chatContactIcons = res;
          this.chatContactIconsLoading = false;
        },
        (err) => {
          this.chatContactIconsLoading = false;
        }
      );
  }

  addIdentityIcon() {
    this.dialogService
      .open(UploadPhotoDialogComponent, {
        size: 'sm',
        data: {
          type: UserIdentityImageType.Brand,
        },
      })
      .afterClosed.subscribe((res) => {
        //this.toastr.success(this.t.instant("success.photoUploaded"));
        this.loadData();
      });
  }

  addChatIcon() {
    this.dialogService
      .open(UploadPhotoDialogComponent, {
        size: 'sm',
        data: {
          type: UserIdentityImageType.Contact,
        },
      })
      .afterClosed.subscribe((res) => {
        //this.toastr.success(this.t.instant("success.photoUploaded"));
        this.loadData();
      });
  }

  delete(id: number, type: UserIdentityImageType) {
    let msg = null;

    if (type == UserIdentityImageType.Contact) {
      msg =
        'This will delete all chats and will disable any active offers with this Contact Contact Profile.';
    }

    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
        data: { message: msg },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          this.brandIdentityIconsLoading = true;
          this.chatContactIconsLoading = true;

          this.identitiesService.apiIdentitiesDelete({ id }).subscribe(
            (res) => {
              this.brandIdentityIconsLoading = false;
              this.chatContactIconsLoading = false;

              this.loadData();
            },
            () => {
              this.brandIdentityIconsLoading = false;
              this.chatContactIconsLoading = false;
            }
          );
        }
      });
  }

  rename(photoId: number, e: any) {
    this.identitiesService
      .apiIdentitiesRenameIdPut({ id: photoId, newName: e.target.value })
      .subscribe((res) => {});
  }
}
