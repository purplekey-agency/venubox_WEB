import {
  AfterViewChecked,
  Component,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as libphonenumber from 'google-libphonenumber';
import {
  ChangeData,
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
  TooltipLabel,
} from 'ngx-intl-tel-input';
import { UsersService } from '../../backend/api/users.service';
import { BaseComponent } from '../../core/components/base/base.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { SaveCategoriesDialogComponent } from './../../shared/components/dialogs/save-categories-dialog/save-categories-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent
  extends BaseComponent
  implements AfterViewChecked
{
  isLoading = false;
  isUploading = false;
  form = new FormGroup({
    name: new FormControl(this.currentUser.name, Validators.required),
    companyName: new FormControl(
      this.currentUser.companyName,
      Validators.required
    ),
    email: new FormControl(this.currentUser.email, [
      Validators.email,
      Validators.required,
    ]),
    phoneNumber: new FormControl(
      this.currentUser.phoneNumber,
      Validators.required
    ),
  });
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedKingdom];
  selectedCountryISO: CountryISO = null;

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private dialogService: DialogService,
    private usersService: UsersService,
    private render: Renderer2,
    private router: Router
  ) {
    super(authService, t);

    if (this.currentUser.phoneNumber) {
      try {
        const util = libphonenumber.PhoneNumberUtil.getInstance();
        const num = util.parse(this.currentUser.phoneNumber);
        const regionCode = util.getRegionCodeForNumber(num);

        if (num && regionCode) {
          const countryisocode = Object.values(CountryISO).indexOf(
            regionCode.toLowerCase() as CountryISO
          );
          let countryiso = Object.values(CountryISO)[countryisocode];

          this.selectedCountryISO = countryiso;
        }
      } catch {}
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

  handleFileInput(files: FileList) {
    this.isUploading = true;

    this.usersService
      .apiUsersMePut({
        profileImage: files.item(0),
      })
      .subscribe(
        (res) => {
          this.isUploading = false;
          this.authService.refreshUser().subscribe();
        },
        () => {
          this.isUploading = false;
        }
      );
  }

  save() {
    this.clearAlerts();

    if (!this.form.valid) {
      this.form.markAsTouched();
      return;
    }

    this.isLoading = true;

    const phoneNumber = this.form.controls.phoneNumber.value as ChangeData;

    this.usersService
      .apiUsersMePut({
        id: this.currentUser.id,
        name: this.form.value.name,
        companyName: this.form.value.companyName,
        phoneNumber: phoneNumber?.e164Number,
        email: this.form.value.email,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.authService.refreshUser().subscribe((res) => {
            if (!res.phoneNumberVerifiedAt || !res.emailVerifiedAt) {
              this.authService.clearAuth();
              this.router.navigate(['/']);
            } else {
              this.router.navigate(['/home']);
            }
          });
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  editCategories() {
    this.dialogService
      .open(SaveCategoriesDialogComponent, {})
      .afterClosed.subscribe((confirmed) => {
        if (confirmed) {
          this.authService.refreshUser().subscribe();
        }
      });
  }
}
