import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';
import { AuthService } from './../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const role = this.authService.getUserRole();

    if (route.data && !route.data.roles.includes(role)) {
      let nextRoute = '';

      switch (role) {
        case UserRoleEnum.SystemAdministrator:
          nextRoute = '/admin/users';
          break;
        default:
          nextRoute = '/home';
          break;
      }

      this.router.navigate([nextRoute]);
      return false;
    }

    return true;
  }
}
