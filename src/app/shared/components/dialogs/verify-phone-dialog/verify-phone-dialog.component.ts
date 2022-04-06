import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TokensService } from '../../../../backend/api/tokens.service';
import { UsersService } from '../../../../backend/api/users.service';
import { UserRoleEnum } from '../../../../backend/model/userRoleEnum';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import {
  DialogConfig,
  DialogService,
} from '../../../../core/dialog/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-phone-dialog',
  templateUrl: './verify-phone-dialog.component.html',
  styleUrls: ['./verify-phone-dialog.component.scss'],
})
export class VerifyPhoneDialogComponent
  extends BaseComponent
  implements OnInit, AfterViewChecked
{
  form = new FormGroup({
    code: new FormControl(''),
    email: new FormControl(''),
  });
  isLoading = false;
  canResendCode = true;
  step: 'code-input' = 'code-input';

  constructor(
    private tokenService: TokensService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private t: TranslateService,
    private dialogService: DialogService,
    private usersService: UsersService,
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private render: Renderer2
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    if (this.dialogConfig.data?.email) {
      this.form.patchValue({
        email: this.dialogConfig.data.email,
      });
    }
  }

  ngAfterViewChecked(): void {
    const getElement: ElementRef | any = document.querySelector(
      `ngx-intl-tel-input .search-container input`
    );
    if (getElement && !getElement.getAttribute('autocomplete')) {
      this.render.setAttribute(getElement, 'autocomplete', 'none');
      this.render.setAttribute(getElement, 'type', 'search');
    }
  }

  submit() {
    this.clearAlerts();

    if (!this.form.valid) {
      this.form.markAsTouched();
      return;
    }

    this.isLoading = true;

    this.usersService
      .apiUsersPhoneVerificationVerifyPost({
        phoneNumberVerificationVerifyCodeDto: {
          userEmail: this.form.value.email,
          code: this.form.value.code,
          role: UserRoleEnum.Brand,
        },
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.dialogRef.close({ success: true });
        },
        (err) => {
          this.isLoading = false;
          this.errorHandler(err, this.form);
        }
      );
  }
}
