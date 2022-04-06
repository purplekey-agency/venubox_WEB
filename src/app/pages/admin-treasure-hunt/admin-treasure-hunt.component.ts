import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { TreasureHuntStatusEnum } from '../../backend/model/treasureHuntStatusEnum';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminHuntsService } from './../../backend/api/adminHunts.service';
import { ConfirmDialogComponent } from './../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

interface UsersTableRow {
  id: number;
  name: string;
  startAt: string;
  endAt: string;
  status: TreasureHuntStatusEnum;
}

@Component({
  selector: 'app-admin-treasure-hunt',
  templateUrl: './admin-treasure-hunt.component.html',
})
export class AdminTreasureHunt extends BasePagedComponent implements OnInit {
  @ViewChild('tableAction', { static: true }) tableAction: TemplateRef<any>;
  @ViewChild('tableStatus', { static: true }) tableStatus: TemplateRef<any>;
  isLoading: boolean;
  rows: UsersTableRow[] = [];
  columns = [];
  TreasureHuntStatusEnum = TreasureHuntStatusEnum;

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private adminHuntsService: AdminHuntsService,
    private router: Router,
    private dialogService: DialogService
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'id', name: this.t.instant('id'), width: 100 },
      { prop: 'name', name: this.t.instant('name') },
      {
        prop: 'startAt',
        name: this.t.instant('startDate'),
      },
      { prop: 'endAt', name: this.t.instant('endDate') },
      {
        prop: 'status',
        name: this.t.instant('status'),
        cellTemplate: this.tableStatus,
        sortable: false,
      },
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

    this.adminHuntsService
      .apiAdminHuntsGet({
        ...this.tableData,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;

          this.pageLoaded(res);
          this.rows = res.results.map((x) => ({
            id: x.id,
            name: x.name ?? '-',
            startAt: moment.utc(x.startAt).local().format('LLL'),
            endAt: moment.utc(x.endAt).local().format('LLL'),
            status: x.status,
          }));
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }

  addTreasureHunt() {
    this.router.navigate(['admin/treasure-hunt/add']);
  }

  editTreasureHunt(id: number) {
    this.router.navigate(['admin/treasure-hunt/' + id]);
  }

  deleteTreasureHunt(id: number) {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
        data: {
          id,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          this.adminHuntsService.apiAdminHuntsIdDelete({ id: id }).subscribe(
            (res) => {
              this.loadData();
            },
            () => {}
          );
        }
      });
  }
}
