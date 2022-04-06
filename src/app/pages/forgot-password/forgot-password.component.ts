import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '../../backend/api/users.service';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';
import { BaseComponent } from './../../core/components/base/base.component';
import { AuthService } from './../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent extends BaseComponent {
  form = new FormGroup({
    email: new FormControl('', Validators.required),
  });

  codeForm = new FormGroup({
    code: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  isLoading = false;
  step: 'email' | 'code' = 'email';

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private t: TranslateService,
    private router: Router
  ) {
    super(authService, t);
  }

  sendCode() {
    this.clearAlerts();

    if (!this.form.valid) {
      this.form.markAsTouched();
      return;
    }

    this.isLoading = true;

    this.usersService
      .apiUsersForgotPasswordRequestPost({
        forgotPasswordRequestDto: {
          emailOrPhoneNumber: this.form.value.email,
          role: UserRoleEnum.Brand,
        },
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.step = 'code';
        },
        (err) => {
          this.isLoading = false;
          this.errorHandler(err, this.form);
        }
      );
  }

  resetPassword() {
    this.clearAlerts();

    if (!this.codeForm.valid) {
      this.form.markAsTouched();
      return;
    }

    this.isLoading = true;

    this.usersService
      .apiUsersForgotPasswordResetPasswordPost({
        forgotPasswordResetDto: {
          emailOrPhoneNumber: this.form.value.email,
          code: this.codeForm.value.code,
          password: this.codeForm.value.password,
          role: UserRoleEnum.Brand,
        },
      })
      .subscribe(
        (res) => {
          this.isLoading = false;

          this.router.navigate(['/'], {
            queryParams: { email: this.form.value.email },
          });
        },
        (err) => {
          this.isLoading = false;
          this.errorHandler(err, this.codeForm);
        }
      );
  }

  // toggleStep() {
  //   this.clearAlerts();
  //   this.form.reset();
  //   this.codeForm.reset();
  //   this.step = this.step === 'email' ? 'code' : 'email';
  // }
}
