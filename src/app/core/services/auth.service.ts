import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsersService } from '../../backend/api/users.service';
import { TokenResponseDto } from '../../backend/model/tokenResponseDto';
import { UserResponseDto } from '../../backend/model/userResponseDto';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';

interface AuthLocalStorage {
  token: string;
  refreshToken: string;
}

interface DecodedToken {
  nameid: string;
  unique_name: string;
  given_name: string;
  family_name: string;
  role: string;
  refreshToken: string;
  nbf: number;
  exp: number;
  iat: number;
  companyId: number;
  email: string;
  profileImage: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  localStorageName = 'auth';
  localStorageUserName = 'user';
  helper = new JwtHelperService();
  onAuthChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
  onUserChange: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private userService: UsersService) {}

  setAuth(response: TokenResponseDto) {
    const item = {
      token: response.accessToken,
      refreshToken: response.refreshToken,
    } as AuthLocalStorage;

    localStorage.setItem(this.localStorageName, JSON.stringify(item));
    this.onAuthChange.next(true);
  }

  getAuth(): AuthLocalStorage | null {
    const item = localStorage.getItem(this.localStorageName);
    return item ? (JSON.parse(item) as AuthLocalStorage) : null;
  }

  clearAuth() {
    localStorage.removeItem(this.localStorageName);
    localStorage.removeItem(this.localStorageUserName);
    this.onAuthChange.next(true);
  }

  isAuth(): boolean {
    return Boolean(this.getAuth());
  }

  getToken(): string {
    const auth = this.getAuth();
    return auth ? auth.token : null;
  }

  isTokenExpired(token): boolean {
    return this.helper.isTokenExpired(token);
  }

  setUser(user: UserResponseDto) {
    localStorage.setItem(this.localStorageUserName, JSON.stringify(user));
    this.onUserChange.next(true);
  }

  getUser(): UserResponseDto | null {
    const item = localStorage.getItem(this.localStorageUserName);
    return item ? (JSON.parse(item) as UserResponseDto) : null;
  }

  refreshUser(): Observable<UserResponseDto> {
    return new Observable((observer) => {
      return this.userService.apiUsersMeGet().subscribe(
        (res) => {
          this.setUser(res);
          observer.next(res);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }

  getUserRole(): UserRoleEnum {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const jwt = new JwtHelperService();
    const decodedToken = jwt.decodeToken(token) as DecodedToken;

    return UserRoleEnum[decodedToken.role];

    let foundRole = null;
    const user = this.getUser();

    if (!user) {
      return foundRole;
    }

    Object.keys(UserRoleEnum).forEach((x) => {
      if (UserRoleEnum[x] == user.role) {
        foundRole = x;
      }
    });

    return foundRole;
  }

  decodeToken(token: string) {
    return this.helper.decodeToken(token);
  }
}
