import { LOCATION_INITIALIZED } from '@angular/common';
import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

export type ValuesOf<T extends any[]> = T[number];
declare var languages: ['en', 'hr'];

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  localStorageName = 'language';

  constructor(private translate: TranslateService) {}

  initialize() {
    const currentLanguage = this.getCurrentLanguage();
    this.translate.setDefaultLang('en');
    this.translate.use(currentLanguage);
  }

  initialize2(translate: TranslateService, injector: Injector) {
    const isDev = !environment.production;

    return async () => {
      await injector.get(LOCATION_INITIALIZED, Promise.resolve(null));

      const currentLanguage = this.getCurrentLanguage();
      translate.setDefaultLang('en');

      try {
        await translate.use(currentLanguage).toPromise();
        if (isDev) {
          console.log(
            `Successfully initialized '${currentLanguage}' language.`
          );
        }
      } catch (err) {
        if (isDev) {
          console.error(
            `Problem with '${currentLanguage}' language initialization.`
          );
        }
      }
    };
  }

  setLanguage(language: ValuesOf<typeof languages>) {
    this.translate.use(language);
    localStorage.setItem(this.localStorageName, language);
    window.location.reload();
  }

  getCurrentLanguage(): ValuesOf<typeof languages> {
    const lsValue = localStorage.getItem(this.localStorageName);
    return (lsValue as ValuesOf<typeof languages>) || 'en';
  }
}
