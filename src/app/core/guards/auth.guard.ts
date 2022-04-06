import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    const isAuth = this.authService.isAuth();

    if (!isAuth) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
