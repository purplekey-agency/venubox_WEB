import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { PromotionService } from '../../backend/api/promotion.service';
import { PromotionStatusEnum } from '../../backend/model/promotionStatusEnum';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
interface PromotionsTableRow {
  id: number;
  created: string;
  name: string;
  geofence: string;
  status: any;
}
@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
})
export class PromotionsComponent extends BasePagedComponent implements OnInit {
  @ViewChild('tableAction', { static: true }) tableAction: TemplateRef<any>;
  @ViewChild('tableStatus', { static: true }) tableStatus: TemplateRef<any>;
  isLoading: boolean;
  rows: PromotionsTableRow[] = [];
  columns = [];
  PromotionStatusEnum = PromotionStatusEnum;

  constructor(
    private authService: AuthService,
    private t: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private promotionService: PromotionService
  ) {
    super(authService, t);
  }

  ngOnInit(): void {
    this.columns = [
      { prop: 'created', name: this.t.instant('created') },
      { prop: 'name', name: this.t.instant('promotionName') },

      {
        prop: 'geofence',
        name: this.t.instant('geofence'),
      },
      {
        prop: 'status',
        name: this.t.instant('status'),
        cellTemplate: this.tableStatus,
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
    const currentUser = this.authService.getUser();
    this.isLoading = true;

    this.promotionService
      .apiPromotionGet({
        ...this.tableData,
        filter: JSON.stringify({ userId: [currentUser.id] }),
      })
      .subscribe(
        (res) => {
          this.isLoading = false;
          const now = new Date().toISOString();

          this.pageLoaded(res);
          this.rows = res.results.map((x) => ({
            id: x.id,
            created: moment.utc(x.createdOn).local().format('LLL'),
            name: x.name,
            geofence: x.geofence?.name,
            status: x.status,
          }));
        },
        (err) => {
          this.isLoading = false;
        }
      );
  }

  editPromotion(promotionId) {
    this.router.navigate(['/promotions/' + promotionId]);
  }

  removePromotion(promotionId) {
    this.dialogService
      .open(ConfirmDialogComponent, {
        size: 'sm',
        data: {
          promotionId,
        },
      })
      .afterClosed.subscribe((res) => {
        if (res && res.confirmed) {
          //this.toastr.success(this.t.instant("success.locationRemoved"));
          this.promotionService
            .apiPromotionIdDelete({ id: promotionId })
            .subscribe(
              (res) => {
                this.loadData();
              },
              () => {}
            );
        }
      });
  }

  addPromotions() {
    this.router.navigate(['/promotions/add']);
  }

  duplicatePromotion(id: number) {
    this.router.navigate(['/promotions/add'], {
      queryParams: { duplicateOf: id },
    });
  }
}
