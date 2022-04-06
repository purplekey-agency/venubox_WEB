import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, from, Observable } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { TokensService } from './../../backend/api/tokens.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private refreshTokenPromise: Promise<any>;

  constructor(
    private authService: AuthService,
    private tokensService: TokensService,
    private configService: ConfigService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    req = req.clone({
      url: req.url.replace('replaceMeInInterceptor', this.configService.apiUrl),
    });

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        !req.url.includes('/assets') &&
        !req.url.includes('refresh-token') &&
        this.authService.isTokenExpired(token)
      ) {
        const refreshToken = this.authService.getAuth().refreshToken;
        if (!this.refreshTokenPromise) {
          this.refreshTokenPromise = this.tokensService
            .refreshTokenPost({
              refreshTokenRequestDto: { refreshToken: refreshToken },
            })
            .toPromise();
        }
      }
    }

    if (this.refreshTokenPromise) {
      return from(this.refreshTokenPromise).pipe(
        catchError((e) => {
          this.refreshTokenPromise = null;
          this.authService.clearAuth();
          this.router.navigate(['/']);
          return EMPTY;
        }),
        switchMap((res) => {
          this.refreshTokenPromise = null;
          this.authService.setAuth(res);
          const newToken = this.authService.getToken();

          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          return next.handle(req);
        })
      );
    }

    return next.handle(req).pipe(
      tap(
        (x) => x,
        (err) => {
          console.error(
            `Error performing request, status code = ${err.status}`
          );
        }
      )
    );
  }
}
