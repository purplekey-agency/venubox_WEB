import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRoleEnum } from './backend/model/userRoleEnum';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RoleGuard } from './core/guards/role.guard';
import { SubscriptionGuard } from './core/guards/subscription.guard';
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

const routes: Routes = [
  {
    path: '',
    canActivate: [GuestGuard],
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'admin',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegistrationComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
    ],
  },
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: [UserRoleEnum.Brand],
    },
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'plans',
        component: PlansComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'help',
        component: HelpComponent,
      },
    ],
  },
  {
    path: '',
    canActivate: [AuthGuard, SubscriptionGuard, RoleGuard],
    data: {
      roles: [UserRoleEnum.Brand],
    },
    children: [
      {
        path: 'geofencing',
        component: GeofencingComponent,
      },
      {
        path: 'promotions',
        component: PromotionsComponent,
      },
      {
        path: 'promotions/add',
        component: SavePromotionComponent,
      },
      {
        path: 'promotions/:id',
        component: SavePromotionComponent,
      },
      {
        path: 'branding',
        component: BrandIdentityComponent,
      },
      {
        path: 'chat',
        component: ChatComponent,
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: [UserRoleEnum.SystemAdministrator],
    },
    children: [
      {
        path: 'users',
        component: AdminUsersComponent,
      },
      {
        path: 'treasure-hunt',
        component: AdminTreasureHunt,
      },
      {
        path: 'treasure-hunt/add',
        component: AdminSaveTreasureHunt,
      },
      {
        path: 'treasure-hunt/:id',
        component: AdminSaveTreasureHunt,
      },
    ],
  },
  {
    path: 'subscription-agreement',
    component: SubscriptionAgreementComponent,
  },

  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
