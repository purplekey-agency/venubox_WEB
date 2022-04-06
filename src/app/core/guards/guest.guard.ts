import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    const isAuth = this.authService.isAuth();

    if (isAuth) {
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
