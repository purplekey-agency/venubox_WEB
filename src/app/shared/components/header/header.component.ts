import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '../../../backend/api/users.service';
import { BaseComponent } from '../../../core/components/base/base.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends BaseComponent implements OnInit {
  isLoggedIn = false;
  userProfileImage: string;
  userId: number;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService,
    private t: TranslateService
  ) {
    super(authService, t);
    this.isLoggedIn = authService.isAuth();
  }

  ngOnInit() {
    this.authService.onAuthChange.subscribe(() => {
      this.isLoggedIn = this.authService.isAuth();

      if (this.isLoggedIn) {
        this.usersService.apiUsersMeGet().subscribe((res) => {
          this.authService.setUser(res);
        });
      }
    });

    this.authService.onUserChange.subscribe(() => {
      const user = this.authService.getUser();

      if (user) {
        this.userId = user.id;

        if (user.profileImage) {
          this.userProfileImage = user.profileImage;
        }
      }
    });
  }

  logout() {
    this.authService.clearAuth();
    this.router.navigate(['/']);
  }
}
