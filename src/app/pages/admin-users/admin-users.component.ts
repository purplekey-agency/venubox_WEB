import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UsersService } from '../../backend/api/users.service';
import { UserRoleEnum } from '../../backend/model/userRoleEnum';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { AdminUsersService } from './../../backend/api/adminUsers.service';

interface UsersTableRow {
  id: number;
  name: string;
  companyName: string;
  role: string;
  createdOn: string;
  email: string;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent extends BasePagedComponent implements OnInit {
  @ViewChild('tableAction', { static: true }) tableAction: TemplateRef<any>;
  isLoading: boolean;
  rows: UsersTableRow[] = [];
  columns = [];

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private usersService: UsersService,
    private dialogService: DialogService,
    private adminUsersService: AdminUsersService
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'id', name: this.t.instant('id') },
      { prop: 'name', name: this.t.instant('name') },
      { prop: 'email', name: this.t.instant('email') },
      {
        prop: 'companyName',
        name: this.t.instant('companyName'),
      },
      { prop: 'role', name: this.t.instant('role') },
      { prop: 'createdOn', name: this.t.instant('registeredAt') },
      {
        prop: 'action',
        name: '',
        cellTemplate: this.tableAction,
        cellClass: 'action-cell',
        sortable: false,
        width: 120,
      },
    ];

    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.usersService
      .apiUsersGet({
        ...this.tableData,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;

          this.pageLoaded(res);
          this.rows = res.results.map((x) => ({
            id: x.id,
            name: x.name ?? '-',
            companyName: x.companyName ?? '-',
            role: this.getUserRoleName(x.role),
            createdOn: moment.utc(x.createdOn).local().format('LLL'),
            email: x.email,
          }));
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }

  getUserRoleName(role: UserRoleEnum) {
    switch (role) {
      case UserRoleEnum.Brand:
        return 'Brand';
      case UserRoleEnum.User:
        return 'User';
      case UserRoleEnum.SystemAdministrator:
        return 'System Administrator';
    }
  }

  deleteUser(id: number) {
    this.dialogService
      .open(ConfirmDialogComponent, { size: 'sm' })
      .afterClosed.subscribe((res) => {
        if (res?.confirmed) {
          this.clearAlerts();

          this.adminUsersService.apiAdminUsersIdDelete({ id }).subscribe(
            (res) => {
              this.loadData();
              this.addAlert({
                message: 'Successfully deleted user.',
                type: 'success',
              });
            },
            (err) => this.errorHandler(err)
          );
        }
      });
  }
}
