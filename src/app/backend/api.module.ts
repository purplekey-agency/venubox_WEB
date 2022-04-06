import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { AdminHuntsService } from './api/adminHunts.service';
import { AdminUsersService } from './api/adminUsers.service';
import { AlertService } from './api/alert.service';
import { CategoryService } from './api/category.service';
import { ChatsService } from './api/chats.service';
import { ContactsService } from './api/contacts.service';
import { DashboardService } from './api/dashboard.service';
import { GeofenceService } from './api/geofence.service';
import { HuntsService } from './api/hunts.service';
import { IdentitiesService } from './api/identities.service';
import { PromotionService } from './api/promotion.service';
import { SubscriptionService } from './api/subscription.service';
import { TemplateService } from './api/template.service';
import { TokensService } from './api/tokens.service';
import { UsersService } from './api/users.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
