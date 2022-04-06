import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import {
  ChangeData,
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
  TooltipLabel,
} from 'ngx-intl-tel-input';
import { CategoryService } from '../../backend/api/category.service';
import { GeofenceService } from '../../backend/api/geofence.service';
import { TokensService } from '../../backend/api/tokens.service';
import { UsersService } from '../../backend/api/users.service';
import { CategoryDto } from '../../backend/model/categoryDto';
import { TokenResponseDto } from '../../backend/model/tokenResponseDto';
import { UserIdentityImageType } from '../../backend/model/userIdentityImageType';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { AddEditLocationComponent } from '../../shared/components/dialogs/add-edit-location/add-edit-location.component';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { PaymentDialogComponent } from '../../shared/components/dialogs/payment-dialog/payment-dialog.component';
import { SkippedSubscriptionDialogComponent } from '../../shared/components/dialogs/skipped-registration-dialog/skipped-registration-dialog.component';
import { VerifyPhoneDialogComponent } from '../../shared/components/dialogs/verify-phone-dialog/verify-phone-dialog.component';
import { VerifyEmailDialogComponent } from './../../shared/components/dialogs/verify-email-dialog/verify-email-dialog.component';
interface GeoTableRow {
  created: string;
  name: string;
  coordinates: string;
  radius: string;
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent
  extends BasePagedComponent
  implements OnInit, AfterViewChecked
{
  userIdentityImageType = UserIdentityImageType;
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedKingdom];

  form = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required),
    companyName: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', Validators.required),
  });

  categoriesForm = new FormGroup({});
  currentStep = 1;

  @ViewChild('tableAction', { static: true }) tableAction: TemplateRef<any>;
  isLoading: boolean;

  geoFencesRows: GeoTableRow[] = [];
  geoFencesColumns = [];

  registrationResponse: TokenResponseDto = null;
  categories: CategoryDto[] = [];
  selectedCategories = [];

  selectedPackage = null;
  selectedTab = null;
  customCode = null;

  constructor(
    private authService: AuthService,
    private tokensService: TokensService,
    private t: TranslateService,
    private dialogService: DialogService,
    private categoryService: CategoryService,
    private usersService: UsersService,
    private router: Router,
    private geofenceService: GeofenceService,
    private render: Renderer2
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    this.geoFencesColumns = [
      { prop: 'created', name: this.t.instant('created') },
      { prop: 'name', name: this.t.instant('name') },

      {
        prop: 'coordinates',
        name: this.t.instant('coordinates'),
      },
      {
        prop: 'radius',
        name: this.t.instant('radius'),
      },
      {
        prop: 'action',
        name: '',
        cellTemplate: this.tableAction,
        cellClass: 'action-cell',
        sortable: false,
        width: 120,
      },
    ];

    this.loadCategories();
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

  loadCategories() {
    this.categoryService.apiCategoryGet().subscribe((res) => {
      this.categories = res;

      const group = {};

      res.forEach((category) => {
        group[category.id] = new FormControl(false);
      });

      this.categoriesForm = new FormGroup(group);
    });
  }

  loadGeofences() {
    this.isLoading = true;

    this.geofenceService.apiGeofenceGet({ ...this.tableData }).subscribe(
      (res) => {
        this.isLoading = false;

        this.pageLoaded(res);
        this.geoFencesRows = res.results.map((x) => ({
          created: moment.utc(x.createdOn).local().format('LLL'),
          name: x.name,
          radius: x.radius.toString(),
          coordinates: `${x.latitude.toString().substr(0, 8)}, ${x.longitude
            .toString()
            .substr(0, 8)}`,
        }));
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  onCategoryChange(e: { toggleId: number }) {
    const category = this.categories.find((x) => x.id === e.toggleId);

    if (category && category.subcategories) {
      const subCategoriesIds = category.subcategories.map((x) => x.id);

      subCategoriesIds.forEach((x) => {
        const foundIndex = this.selectedCategories.findIndex((y) => y === x);

        if (foundIndex !== -1) {
          this.selectedCategories.splice(foundIndex, 1);
        }
      });
    }
  }

  onSubCategoryChange(e: { value: number }) {
    let parentCategory: CategoryDto = null;

    this.categories.forEach((x) => {
      const foundCategory = x.subcategories.find((x) => x.id === e.value);

      if (foundCategory) {
        parentCategory = x;
      }
    });

    if (parentCategory) {
      const parentCategorySubcategories = parentCategory.subcategories.map(
        (x) => x.id
      );
      parentCategorySubcategories.forEach((x) => {
        const foundIndex = this.selectedCategories.findIndex((y) => y === x);

        if (foundIndex !== -1) {
          this.selectedCategories.splice(foundIndex, 1);
        }
      });

      this.selectedCategories = [...this.selectedCategories, e.value];
    }
  }

  isSubCategorySelected(id: number) {
    const foundIndex = this.selectedCategories.findIndex((x) => x === id);
    return foundIndex !== -1;
  }

  addLocation() {
    this.dialogService
      .open(AddEditLocationComponent, {
        className: 'location-dialog',
        size: 'md',
      })
      .afterClosed.subscribe((res) => {
        if (res && res.save) {
          //this.toastr.success(this.t.instant("success.locationCreated"));
          this.loadGeofences();
        }
      });
  }

  editLocation(locationId) {
    this.dialogService
      .open(AddEditLocationComponent, {
        className: 'location-dialog',
        size: 'md',
        data: {
          locationId,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.save) {
          //this.toastr.success(this.t.instant("success.locationEdited"));
          this.ngOnInit();
        }
      });
  }
  removeLocation(locationId) {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
        data: {
          locationId,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.save) {
          //this.toastr.success(this.t.instant("success.locationRemoved"));
          this.ngOnInit();
        }
      });
  }

  loginRegisterErrorHandler(err: any) {
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
            this.tryLogin();
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
            this.tryLogin();
          }
        });
    } else {
      this.errorHandler(err, this.form);
    }
  }

  tryLogin() {
    this.isLoading = true;

    this.tokensService
      .loginPost({
        loginRequestDto: {
          email: this.form.value.email,
          password: this.form.value.password,
          role: UserRoleEnum.Brand,
        },
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.currentStep = 2;
          this.registrationResponse = res;
          this.authService.setAuth(res);
        },
        (err) => {
          this.isLoading = false;
          this.loginRegisterErrorHandler(err);
        }
      );
  }

  next() {
    if (this.currentStep === 1) {
      this.clearAlerts();
      this.isLoading = true;
      const phoneNumber = this.form.controls.phoneNumber.value as ChangeData;

      this.tokensService
        .registerBrandPost({
          registerRequestDto: {
            email: this.form.controls.email.value,
            companyName: this.form.controls.companyName.value,
            password: this.form.controls.password.value,
            phoneNumber: phoneNumber?.e164Number,
            role: UserRoleEnum.Brand,
          },
        })
        .subscribe(
          (res) => {
            // this.isLoading = false;
            // this.currentStep = 2;
            // this.registrationResponse = res;
            // this.authService.setAuth(res);
          },
          (err) => {
            this.isLoading = false;
            this.loginRegisterErrorHandler(err);
          }
        );
    } else if (this.currentStep === 2) {
      this.isLoading = true;

      this.usersService
        .apiUsersMeCategoriesPost({
          requestBody: this.selectedCategories,
        })
        .subscribe(
          (res) => {
            this.isLoading = false;
            this.currentStep = 3;
            this.loadGeofences();
          },
          (err) => {
            this.isLoading = false;
            this.errorHandler(err);
          }
        );
    } else if (this.currentStep === 5) {
      this.dialogService.open(PaymentDialogComponent, {
        closeOnClickOutside: false,
        className: 'payment-dialog',
        data: {
          id: this.selectedPackage,
          frequency: this.selectedTab,
          code: this.customCode,
        },
      });
    } else {
      this.currentStep += 1;
    }
  }

  skip() {
    if (this.currentStep === 5) {
      this.dialogService.open(SkippedSubscriptionDialogComponent, {
        closeOnClickOutside: false,
      });
      return;
    }

    this.currentStep += 1;
  }

  newBrandLogo(event) {
    console.log(event);
  }

  newChatContactProfiles(event) {
    console.log(event);
  }

  packageSelected(id: number) {
    this.selectedPackage = id;
  }

  tabSelected(tab: string) {
    this.selectedTab = tab;
  }

  customCodeChanged(code: string) {
    this.customCode = code;
  }
}
