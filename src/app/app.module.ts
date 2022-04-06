import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  HttpBackend,
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  APP_INITIALIZER,
  DEFAULT_CURRENCY_CODE,
  Injector,
  LOCALE_ID,
  NgModule,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {
  DlDateTimeDateModule,
  DlDateTimePickerModule,
} from 'angular-bootstrap-datetimepicker';
import { EmailEditorModule } from 'angular-email-editor';
import * as momentTZ from 'moment-timezone';
import 'moment/locale/en-gb';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxStripeModule, STRIPE_PUBLISHABLE_KEY } from 'ngx-stripe';
import { ToastrModule } from 'ngx-toastr';
import { Observable, ObservableInput, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BASE_PATH } from './backend';
// import { BASE_PATH } from './backend/variables';
import { DialogModule } from './core/dialog/dialog.module';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { AppDatePipe } from './core/pipes/app-date.pipe';
import { ConfigService } from './core/services/config.service';
import { I18nService } from './core/services/i18n.service';
import { AdminSaveTreasureHunt } from './pages/admin-save-treasure-hunt/admin-save-treasure-hunt.component';
import { AdminTreasureHunt } from './pages/admin-treasure-hunt/admin-treasure-hunt.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { BrandIdentityComponent } from './pages/brand-identity/brand-identity.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { GeofencingComponent } from './pages/geofencing/geofencing.component';
import { HelpComponent } from './pages/help/help.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PlansComponent } from './pages/plans/plans.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PromotionsComponent } from './pages/promotions/promotions.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { SavePromotionComponent } from './pages/save-promotion/save-promotion.component';
import { SubscriptionAgreementComponent } from './pages/subscription-agreement/subscription-agreement.component';
import { TestComponent } from './pages/test/test.component';
import { AlertsComponent } from './shared/components/alerts/alerts.component';
import { DateTimeInputComponent } from './shared/components/date-time-input/date-time-input.component';
import { AddEditLocationComponent } from './shared/components/dialogs/add-edit-location/add-edit-location.component';
import { CancelSubscriptionDialogComponent } from './shared/components/dialogs/cancel-subscription-dialog/cancel-subscription-dialog.component';
import { ChooseLocationDialog } from './shared/components/dialogs/choose-location/choose-location-dialog.component';
import { ConfirmDialogComponent } from './shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { PaymentDialogComponent } from './shared/components/dialogs/payment-dialog/payment-dialog.component';
import { PhotoChooserDialogComponent } from './shared/components/dialogs/photo-chooser-dialog/photo-chooser-dialog.component';
import { PromotionPlannedActivityDialogComponent } from './shared/components/dialogs/promotion-planned-activity/promotion-planned-activity.component';
import { PromotionTemplatesDialogComponent } from './shared/components/dialogs/promotion-templates-dialog/promotion-templates-dialog.component';
import { SaveCategoriesDialogComponent } from './shared/components/dialogs/save-categories-dialog/save-categories-dialog.component';
import { SkippedSubscriptionDialogComponent } from './shared/components/dialogs/skipped-registration-dialog/skipped-registration-dialog.component';
import { UploadPhotoDialogComponent } from './shared/components/dialogs/upload-photo-dialog/upload-photo-dialog.component';
import { VerifyEmailDialogComponent } from './shared/components/dialogs/verify-email-dialog/verify-email-dialog.component';
import { VerifyPhoneDialogComponent } from './shared/components/dialogs/verify-phone-dialog/verify-phone-dialog.component';
import { FormErrorComponent } from './shared/components/form-error/form-error.component';
import { GifPickerComponent } from './shared/components/gif-picker/gif-picker.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { PhotoUploadComponent } from './shared/components/photo-upload/photo-upload.component';
import { RadioButtonComponent } from './shared/components/radio-button/radio-button.component';
import { SelectComponent } from './shared/components/select/select.component';
import { SubscriptionPlansComponent } from './shared/components/subscription-plans/subscription-plans.component';
import { TextInputComponent } from './shared/components/text-input/text-input.component';
import { TimeSelectComponent } from './shared/components/time-select/time-select.component';
import { ToggleComponent } from './shared/components/toggle/toggle.component';
import { DateInputFormatDirective } from './shared/directives/date-input.directive';

momentTZ.locale('en-gb');
momentTZ.tz.setDefault('Europe/London');

const dialogComponents = [];
@NgModule({
  declarations: [
    ...dialogComponents,
    AppComponent,
    TestComponent,
    AlertsComponent,
    FormErrorComponent,
    NotFoundComponent,
    LoginComponent,
    HeaderComponent,
    TextInputComponent,
    RegistrationComponent,
    ToggleComponent,
    RadioButtonComponent,
    PhotoUploadComponent,
    HomeComponent,
    SelectComponent,
    AddEditLocationComponent,
    ConfirmDialogComponent,
    GeofencingComponent,
    PromotionsComponent,
    BrandIdentityComponent,
    UploadPhotoDialogComponent,
    SavePromotionComponent,
    DateTimeInputComponent,
    DateInputFormatDirective,
    ChatComponent,
    PhotoChooserDialogComponent,
    ForgotPasswordComponent,
    SubscriptionPlansComponent,
    PaymentDialogComponent,
    PlansComponent,
    CancelSubscriptionDialogComponent,
    SkippedSubscriptionDialogComponent,
    PromotionTemplatesDialogComponent,
    ProfileComponent,
    TimeSelectComponent,
    SaveCategoriesDialogComponent,
    GifPickerComponent,
    PromotionPlannedActivityDialogComponent,
    VerifyEmailDialogComponent,
    VerifyPhoneDialogComponent,
    AdminUsersComponent,
    AdminTreasureHunt,
    AdminSaveTreasureHunt,
    ChooseLocationDialog,
    AppDatePipe,
    SubscriptionAgreementComponent,
    HelpComponent,
  ],
  entryComponents: [...dialogComponents],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxDatatableModule,
    DialogModule,
    AppRoutingModule,
    EmailEditorModule,
    DlDateTimeDateModule,
    DlDateTimePickerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxIntlTelInputModule,
    BrowserAnimationsModule,
    NgxStripeModule.forRoot(),
    NgxCleaveDirectiveModule,
    PickerModule,
    DragDropModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    ApiInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'en-gb' },
    // {
    //   provide: OWL_DATE_TIME_LOCALE,
    //   useValue: 'en-GB'
    // },
    {
      provide: APP_INITIALIZER,
      useFactory: i18nFactory,
      deps: [TranslateService, Injector],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      multi: true,
      deps: [HttpBackend, ConfigService],
    },
    {
      provide: BASE_PATH,
      useFactory: getApiUrl,
      deps: [ConfigService],
    },
    {
      provide: STRIPE_PUBLISHABLE_KEY,
      useFactory: getStripePublishableKey,
      deps: [ConfigService],
    },
    {
      provide: BASE_PATH,
      useValue: 'replaceMeInInterceptor',
    },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'GBP' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
export function i18nFactory(
  translateService: TranslateService,
  injector: Injector
) {
  return new I18nService(translateService).initialize2(
    translateService,
    injector
  );
}

export function getApiUrl(config: ConfigService) {
  return config.apiUrl;
}
export function getStripePublishableKey(config: ConfigService) {
  return config.stripePublishableKey;
}

export function loadConfig(
  handler: HttpBackend,
  config: ConfigService
): () => Promise<boolean> {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      const http = new HttpClient(handler);
      http
        .get('./configs/config.json')
        .pipe(
          map((x: ConfigService) => {
            config.apiUrl = x.apiUrl;
            config.googleApiKey = x.googleApiKey;
            config.stripePublishableKey = x.stripePublishableKey;
            resolve(true);
          }),
          catchError(
            (
              x: { status: number },
              caught: Observable<void>
            ): ObservableInput<{}> => {
              if (x.status !== 404) {
                resolve(false);
              }

              console.error('Can not find config.json');
              resolve(true);
              return of({});
            }
          )
        )
        .subscribe();
    });
  };
}
