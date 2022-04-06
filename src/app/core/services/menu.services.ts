import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';
import { AuthService } from './auth.service';

interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

export interface Menu {
  userRole: UserRoleEnum;
  items: MenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  menus: Menu[] = [];

  constructor(private authService: AuthService, private t: TranslateService) {
    const menuItems = {};

    this.menus = [];
  }

  getCurrentUserRoleMenu() {
    const role = this.authService.getUserRole();
    return this.menus.find((menu) => menu.userRole === role);
  }
}
