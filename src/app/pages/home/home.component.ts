import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import {
  ApiDashboardStatisticsGetRequestParams,
  DashboardService,
} from '../../backend/api/dashboard.service';
import { PromotionResponseDto } from '../../backend/model/promotionResponseDto';
import { SubscriptionFrequencyEnum } from '../../backend/model/subscriptionFrequencyEnum';
import { SubscriptionResponseDto } from '../../backend/model/subscriptionResponseDto';
import { BaseComponent } from '../../core/components/base/base.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { CancelSubscriptionDialogComponent } from '../../shared/components/dialogs/cancel-subscription-dialog/cancel-subscription-dialog.component';
import { SelectOption } from '../../shared/components/select/select.component';
import { DashboardStatisticsResponseDto } from './../../backend/model/dashboardStatisticsResponseDto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends BaseComponent implements OnInit {
  periods: SelectOption[] = [
    {
      value: 'today',
      label: 'Today',
    },
    {
      value: 'this-week',
      label: 'This week',
    },
    {
      value: 'this-month',
      label: 'This month',
    },
  ];

  filterForm = new FormGroup({
    statsPeriod: new FormControl('today'),
    performancePeriod: new FormControl('today'),
  });

  selectedStatsPeriod: SelectOption = this.periods[0];
  selectedPerformancePeriod: SelectOption = this.periods[0];

  stats: DashboardStatisticsResponseDto = null;
  promotions: PromotionResponseDto[] = [];
  isLoadingPromotions = false;

  activeSubscription: SubscriptionResponseDto = null;
  activeSubscriptionPrecentageUsed = 0;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    authService: AuthService,
    translateService: TranslateService,
    private dialogService: DialogService
  ) {
    super(authService, translateService);

    this.filterForm.controls.statsPeriod.valueChanges.subscribe((res) => {
      setTimeout(() => {
        this.loadStatistics();
      });
    });

    this.filterForm.controls.performancePeriod.valueChanges.subscribe((res) => {
      setTimeout(() => {
        this.loadPromotions();
      });
    });

    authService.onUserChange.subscribe(() => {
      const user = authService.getUser();

      if (user?.activeSubscriptions?.length) {
        const hasRegularSubscription = user.activeSubscriptions.find(
          (x) => x.frequency != SubscriptionFrequencyEnum.Once
        );

        if (hasRegularSubscription) {
          this.activeSubscription = user.activeSubscriptions[0];
        } else {
          this.activeSubscription = {
            planName:
              user.activeSubscriptions.length > 1
                ? `PAYG (x${user.activeSubscriptions.length})`
                : 'PAYG',
            frequency: SubscriptionFrequencyEnum.Once,
            brandIdentityLimit: user.activeSubscriptions
              .map((x) => x.brandIdentityLimit || 0)
              .reduce((a, b) => a + b, 0),
            brandIdentityUsed: user.activeSubscriptions
              .map((x) => x.brandIdentityUsed || 0)
              .reduce((a, b) => a + b, 0),
            contactIdentityLimit: user.activeSubscriptions
              .map((x) => x.contactIdentityLimit || 0)
              .reduce((a, b) => a + b, 0),
            contactIdentityUsed: user.activeSubscriptions
              .map((x) => x.contactIdentityUsed || 0)
              .reduce((a, b) => a + b, 0),
            geofencesLimit: user.activeSubscriptions
              .map((x) => x.geofencesLimit || 0)
              .reduce((a, b) => a + b, 0),
            geofencesUsed: user.activeSubscriptions
              .map((x) => x.geofencesUsed || 0)
              .reduce((a, b) => a + b, 0),
            promotionsLimit: user.activeSubscriptions
              .map((x) => x.promotionsLimit || 0)
              .reduce((a, b) => a + b, 0),
            promotionsUsed: user.activeSubscriptions
              .map((x) => x.promotionsUsed || 0)
              .reduce((a, b) => a + b, 0),
          };
        }

        const as = this.activeSubscription;

        const limits =
          as.brandIdentityLimit +
          as.contactIdentityLimit +
          as.geofencesLimit +
          as.promotionsLimit;

        const usages =
          as.brandIdentityUsed +
          as.contactIdentityUsed +
          as.geofencesUsed +
          as.promotionsUsed;

        if (usages != 0) {
          const percentage = Math.round((usages / limits) * 100);

          this.activeSubscriptionPrecentageUsed =
            percentage <= 100 ? percentage : 100;
        }
      } else {
        this.activeSubscription = null;
        this.activeSubscriptionPrecentageUsed = 0;
      }
    });
  }

  ngOnInit() {
    this.loadStatistics();
    this.loadPromotions();
  }

  loadStatistics() {
    let requestDto: ApiDashboardStatisticsGetRequestParams = {};

    const period = this.filterForm.value.statsPeriod;

    if (period === 'today') {
      requestDto = {
        dateFrom: moment().utc().startOf('day').toISOString(),
        dateTo: moment().utc().endOf('day').toISOString(),
      };
    } else if (period === 'this-week') {
      requestDto = {
        dateFrom: moment().utc().startOf('week').toISOString(),
        dateTo: moment().utc().endOf('week').toISOString(),
      };
    } else if (period === 'this-month') {
      requestDto = {
        dateFrom: moment().utc().startOf('month').toISOString(),
        dateTo: moment().utc().endOf('month').toISOString(),
      };
    }

    this.dashboardService
      .apiDashboardStatisticsGet(requestDto)
      .subscribe((res) => {
        this.stats = res;
      });
  }

  loadPromotions() {
    let requestDto: ApiDashboardStatisticsGetRequestParams = {};

    const period = this.filterForm.value.performancePeriod;

    if (period === 'today') {
      requestDto = {
        dateFrom: moment().utc().startOf('day').toISOString(),
        dateTo: moment().utc().endOf('day').toISOString(),
      };
    } else if (period === 'this-week') {
      requestDto = {
        dateFrom: moment().utc().startOf('week').toISOString(),
        dateTo: moment().utc().endOf('week').toISOString(),
      };
    } else if (period === 'this-month') {
      requestDto = {
        dateFrom: moment().utc().startOf('month').toISOString(),
        dateTo: moment().utc().endOf('month').toISOString(),
      };
    }

    this.isLoadingPromotions = true;

    this.dashboardService.apiDashboardPromotionsGet(requestDto).subscribe(
      (res) => {
        this.promotions = res;
        this.isLoadingPromotions = false;
      },
      () => {
        this.isLoadingPromotions = false;
      }
    );
  }

  goToGeofencing() {
    this.router.navigate(['geofencing']);
  }

  goToPromotions() {
    this.router.navigate(['promotions']);
  }
  goToBranding() {
    this.router.navigate(['branding']);
  }

  goToChat() {
    this.router.navigate(['chat']);
  }

  getFrequency(frequency: SubscriptionFrequencyEnum) {
    switch (frequency) {
      case SubscriptionFrequencyEnum.Monthly:
        return 'Monthly';
      case SubscriptionFrequencyEnum.HalfYearly:
        return 'Half-Yearly';
      case SubscriptionFrequencyEnum.Yearly:
        return 'Yearly';
    }
  }

  cancelSubscription() {
    this.dialogService
      .open(CancelSubscriptionDialogComponent, { closeOnClickOutside: false })
      .afterClosed.subscribe((res) => {});
  }
}
