import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserResponseDto } from '../../../backend/model/userResponseDto';
import { UserRoleEnum } from '../../../backend/model/userRoleEnum';
import { Alert } from '../../../shared/components/alerts/alerts.component';
import { AuthService } from '../../services/auth.service';

export class BaseComponent {
  isUser = false;
  isBrand = false;
  isSysAdmin = false;
  currentUser: UserResponseDto = null;

  alerts: Alert[] = [];

  constructor(
    authService: AuthService,
    private translateService: TranslateService
  ) {
    const role = authService.getUserRole();
    this.setUserRoles(role);

    authService.onUserChange.subscribe(() => {
      const user = authService.getUser();
      this.currentUser = user;
      this.setUserRoles(authService.getUserRole());
    });
  }

  setUserRoles(role: UserRoleEnum | null) {
    if (role === null) {
      this.isUser = false;
      this.isBrand = false;
      this.isSysAdmin = false;
      return;
    }

    this.isUser = role === UserRoleEnum.User;
    this.isBrand = role === UserRoleEnum.Brand;
    this.isSysAdmin = role === UserRoleEnum.SystemAdministrator;
  }

  clearAlerts() {
    this.alerts = [];
  }

  addAlert(alert: Alert) {
    this.alerts.push(alert);
  }

  errorHandler(response: HttpErrorResponse, form?: FormGroup, ref?: string) {
    if (response.status === 500) {
      this.addAlert({
        type: 'danger',
        message: 'Oops, something is not right.',
        ref,
      });
      return;
    }

    if (response.error) {
      const errorMessage = response.error.message;

      if (errorMessage) {
        this.addAlert({
          type: 'danger',
          message: this.translateService.instant('exception.' + errorMessage),
          ref,
        });
      }
    }

    if (form && response.error.errors) {
      const responseErrors = response.error.errors;

      Object.keys(responseErrors).forEach((i) => {
        const formError = responseErrors[i];
        let formControl = form.controls[formError?.field?.toCamelCase()];
        console.log(formError.field);

        if (!formControl) {
          formControl = form.controls[i.toCamelCase()];
        }

        const errors: ValidationErrors = {};
        if (formError.error === 'Required') {
          errors.required = true;
        } else if (formError.error === 'PhoneNumberFormatInvalid') {
          errors.phoneNumberFormatInvalid = true;
        } else if (formError.error === 'NotValidEmailAddress') {
          errors.email = true;
        } else if (formError.error === 'EmailInUse') {
          errors.emailInUse = true;
        } else if (formError.error === 'PhoneNumberAlreadyInUse') {
          errors.phoneNumberInUse = true;
        } else {
          errors.unknown = true;
        }

        if (formControl) {
          formControl.setErrors(errors);
          formControl.markAsTouched();
          formControl.markAsDirty();
        }
      });
    }
  }
}
