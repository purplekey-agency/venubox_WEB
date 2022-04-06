import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../core/components/base/base.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentDialogComponent } from './../../shared/components/dialogs/payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],
})
export class PlansComponent extends BaseComponent {
  selectedPackage = null;
  customCode = null;
  selectedTab = null;

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private dialogService: DialogService
  ) {
    super(authService, t);
  }

  pay() {
    this.dialogService.open(PaymentDialogComponent, {
      closeOnClickOutside: false,
      data: {
        id: this.selectedPackage,
        frequency: this.selectedTab,
        code: this.customCode,
      },
      className: 'payment-dialog',
    });
  }

  packageSelected(id: number) {
    this.selectedPackage = id;
  }

  customCodeChanged(code: string) {
    this.customCode = code;
  }

  tabSelected(tab: string) {
    this.selectedTab = tab;
  }
}
