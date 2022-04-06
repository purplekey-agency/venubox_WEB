import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';

@Component({
  selector: 'app-skipped-registration-dialog',
  templateUrl: './skipped-registration-dialog.component.html',
  styleUrls: ['./skipped-registration-dialog.component.scss'],
})
export class SkippedSubscriptionDialogComponent {
  isLoading = false;

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    private router: Router
  ) {
    const config = this.dialogConfig;
  }

  ok() {
    this.dialogRef.close();
    this.router.navigate(['/home']);
  }
}
