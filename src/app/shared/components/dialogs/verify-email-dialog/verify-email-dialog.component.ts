import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  selector: 'app-verify-email-dialog',
  templateUrl: './verify-email-dialog.component.html',
  styleUrls: ['./verify-email-dialog.component.scss'],
})
export class VerifyEmailDialogComponent
  extends BaseComponent
  implements OnInit
{
  form = new FormGroup({
    code: new FormControl('', [Validators.required]),
    email: new FormControl(''),
  });
  isLoading = false;
  canResendCode = true;

  constructor(
    private tokenService: TokensService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private t: TranslateService,
    private dialogService: DialogService,
    private usersService: UsersService,
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    // const routeEmail = this.route.snapshot.queryParamMap.get('email');
    // if (routeEmail) {
    //   this.form.patchValue({
    //     email: routeEmail,
    //   });
    //   this.router.navigate([], {
    //     queryParams: {
    //       email: null,
    //     },
    //     queryParamsHandling: 'merge',
    //   });
    // }

    if (this.dialogConfig.data.email) {
      this.form.patchValue({
        email: this.dialogConfig.data.email,
      });
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
      .apiUsersEmailVerificationVerifyPost({
        emailVerificationVerifyCodeDto: {
          email: this.form.value.email,
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

  resendCode() {
    if (!this.canResendCode) {
      return;
    }

    this.canResendCode = false;

    this.usersService
      .apiUsersEmailVerificationResendPost({
        emailVerificationRequestDto: {
          email: this.form.value.email,
          role: UserRoleEnum.Brand,
        },
      })
      .subscribe((res) => {});
  }
}
