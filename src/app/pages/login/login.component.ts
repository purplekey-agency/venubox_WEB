import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TokensService } from '../../backend/api/tokens.service';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';
import { BaseComponent } from '../../core/components/base/base.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { VerifyEmailDialogComponent } from '../../shared/components/dialogs/verify-email-dialog/verify-email-dialog.component';
import { VerifyPhoneDialogComponent } from '../../shared/components/dialogs/verify-phone-dialog/verify-phone-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
  });
  isLoading = false;
  isAdminLogin = false;
  passwordInputType = 'password';

  constructor(
    private tokenService: TokensService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private t: TranslateService,
    private dialogService: DialogService
  ) {
    super(authService, t);

    this.isAdminLogin = router.url.includes('admin');
  }

  ngOnInit(): void {
    const routeEmail = this.route.snapshot.queryParamMap.get('email');

    if (routeEmail) {
      this.form.patchValue({
        email: routeEmail,
      });

      this.router.navigate([], {
        queryParams: {
          email: null,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  submit() {
    this.clearAlerts();

    if (!this.form.valid) {
      this.form.markAsTouched();
      this.addAlert({
        message: this.t.instant('youMustEnterEmailAndPassword'),
        type: 'danger',
      });
      return;
    }
    this.isLoading = true;

    let role = UserRoleEnum.Brand;

    if (this.router.url.includes('admin')) {
      role = UserRoleEnum.SystemAdministrator;
    }

    this.tokenService
      .loginPost({
        loginRequestDto: {
          ...this.form.value,
          role,
        },
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.authService.setAuth(res);

          const decodedToken = this.authService.decodeToken(res.accessToken);

          if (decodedToken.role === 'User') {
            this.addAlert({
              message:
                'Only brands can sign in here. Please use the Android or iOS app instead.',
              type: 'info',
            });
            this.authService.clearAuth();
            return;
          }

          this.router.navigate(['/home']);
        },
        (err) => {
          this.isLoading = false;

          if (err.error.message === 'EmailNotVerified') {
            this.dialogService
              .open(VerifyEmailDialogComponent, {
                data: {
                  email: this.form.value.email,
                },
                size: 'sm',
              })
              .afterClosed.subscribe((res) => {
                if (res?.success) {
                  this.submit();
                }
              });
          } else if (err.error.message === 'PhoneNumberNotVerified') {
            this.dialogService
              .open(VerifyPhoneDialogComponent, {
                size: 'sm',
                className: 'phone-verification-dialog',
                data: {
                  email: this.form.value.email,
                },
              })
              .afterClosed.subscribe((res) => {
                if (res?.success) {
                  this.submit();
                }
              });
          } else {
            this.errorHandler(err, this.form);
          }
        }
      );
  }

  registration() {
    this.router.navigate(['register']);
  }
}
