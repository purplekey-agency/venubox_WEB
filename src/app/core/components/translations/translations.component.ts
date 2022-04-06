import { TranslateService } from '@ngx-translate/core';

export class TranslationsComponent {
  constructor(private t: TranslateService) {
    t.instant('exception.ValidationErrors');
    t.instant('exception.InvalidEmailOrPassword');
    t.instant('exception.CantSubscribeToSamePlan');
    t.instant('exception.ActivePromotionsLimitReached');
    t.instant('exception.NoSubscriptionFound');
    t.instant('exception.CantPurchasePAYG');
    t.instant('exception.ContactIdentitiesLimitReached');
    t.instant('exception.BrandIdentitiesLimitReached');
    t.instant('exception.GeofencesLimitReached');
    t.instant('exception.CategoriesRequired');
    t.instant('exception.InvalidOrExpiredCode');
    t.instant('exception.EmailNotVerified');
    t.instant('exception.PhoneNumberNotVerified');
    t.instant('exception.UserNotFound');
    t.instant('exception.PhoneNumberAlreadyInUse');
  }
}
