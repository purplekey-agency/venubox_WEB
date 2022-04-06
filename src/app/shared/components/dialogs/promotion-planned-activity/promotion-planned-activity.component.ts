import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { PromotionService } from '../../../../backend/api/promotion.service';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';

interface Template {
  id?: number;
  html: any;
  iframeHtml: any;
  template: any;
}

@Component({
  selector: 'app-promotion-planned-activity',
  templateUrl: './promotion-planned-activity.component.html',
  styleUrls: ['./promotion-planned-activity.component.scss'],
})
export class PromotionPlannedActivityDialogComponent implements OnInit {
  isLoading = false;
  plannedActivity: { from: string; to: string; isInPast: boolean }[] = [];

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService,
    private router: Router,
    private promotionService: PromotionService
  ) {
    const config = this.dialogConfig;
  }

  ngOnInit() {
    this.isLoading = true;

    this.promotionService
      .apiPromotionPlannedActivityPost({
        promotionPlannedActivityRequestDto: this.dialogConfig.data,
      })
      .subscribe(
        (res) => {
          this.isLoading = false;

          const now = moment();

          this.plannedActivity = res.map((x) => {
            const from = moment(x.from).local().format('LLL');
            const to = moment(x.to).local().format('LLL');
            const isInPast = moment(to).diff(now) < 0;

            return {
              from,
              to,
              isInPast,
            };
          });
        },
        () => {}
      );
  }
}
