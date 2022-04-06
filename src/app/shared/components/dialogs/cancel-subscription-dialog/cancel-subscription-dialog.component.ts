import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionService } from '../../../../backend/api/subscription.service';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cancel-subscription-dialog',
  templateUrl: './cancel-subscription-dialog.component.html',
  styleUrls: ['./cancel-subscription-dialog.component.scss'],
})
export class CancelSubscriptionDialogComponent {
  isLoading = false;

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) {
    const config = this.dialogConfig;
  }

  close(confirmed?: boolean) {
    this.dialogRef.close({ confirmed });
  }

  accept() {
    this.isLoading = true;

    this.subscriptionService.apiSubscriptionCancelPost().subscribe(
      (res) => {
        this.authService.refreshUser().subscribe((res) => {
          this.close(true);
          this.isLoading = false;
        });
      },
      () => {
        this.isLoading = false;
      }
    );
  }
}
