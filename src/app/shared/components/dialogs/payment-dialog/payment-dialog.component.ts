import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  StripeCardCvcElementOptions,
  StripeCardElementOptions,
  StripeCardExpiryElementOptions,
  StripeCardNumberElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import * as moment from 'moment';
import { StripeCardNumberComponent, StripeService } from 'ngx-stripe';
import { SubscriptionService } from '../../../../backend/api/subscription.service';
import { SubscriptionFrequencyEnum } from '../../../../backend/model/subscriptionFrequencyEnum';
import { BaseComponent } from '../../../../core/components/base/base.component';
import { DialogRef } from '../../../../core/dialog/dialog-ref';
import { DialogConfig } from '../../../../core/dialog/dialog.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Plan, PlansService } from '../../../../services/plans.service';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
})
export class PaymentDialogComponent extends BaseComponent {
  @ViewChild(StripeCardNumberComponent) card: StripeCardNumberComponent;
  isLoading = false;
  isLoadingCustomPlan = false;
  selectedPlanLocalId = 0;
  selectedPlan: Plan | null = null;
  customCode = null;
  trialEnding: Date = null;
  frequency: 'monthly' | 'yearly' = 'monthly';
  step: 'card-input' | 'terms' | 'processing' | 'finalizing' | 'success' =
    'card-input';
  acceptedTerms = false;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        color: '#333',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#ccc',
        },
      },
    },
  };

  cardNumberOptions: StripeCardNumberElementOptions = {
    ...this.cardOptions,
    placeholder: 'Card number',
    showIcon: true,
  };

  cardExpirationOptions: StripeCardExpiryElementOptions = {
    ...this.cardOptions,
    placeholder: 'Expiration',
  };

  cardCvcOptions: StripeCardCvcElementOptions = {
    ...this.cardOptions,
    placeholder: 'CVC',
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en-GB',
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Poppins',
      },
    ],
  };

  stripeForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private stripeService: StripeService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    translateService: TranslateService,
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private plansService: PlansService,
    private router: Router
  ) {
    super(authService, translateService);

    const config = this.dialogConfig;

    this.selectedPlanLocalId = config.data && config.data.id;
    this.customCode = config.data.code;
    this.selectedPlan = plansService.getById(this.selectedPlanLocalId);

    this.frequency =
      config?.data?.frequency == 'monthly' ? 'monthly' : 'yearly';

    if (this.selectedPlan?.hasTrial) {
      this.trialEnding = moment().add(3, 'months').toDate();
    }

    if (this.customCode) {
      this.isLoadingCustomPlan = true;

      this.subscriptionService
        .apiSubscriptionPlanGet({ code: this.customCode })
        .subscribe(
          (res) => {
            let contractMonths = 0;

            switch (res.frequency) {
              case SubscriptionFrequencyEnum.Monthly:
                this.frequency = 'monthly';
                break;
              case SubscriptionFrequencyEnum.HalfYearly:
                this.frequency = 'yearly';
                contractMonths = 6;
                break;
              case SubscriptionFrequencyEnum.Yearly:
                this.frequency = 'yearly';
                contractMonths = 12;
                break;
            }

            this.selectedPlan = {
              id: -1,
              name: res.name,
              description: '',
              brandIdentitiesLimit: res.brandIdentityLimit,
              contactIdentitiesLimit: res.contactIdentityLimit,
              geofencesLimit: res.geofencesLimit,
              activePromotionsLimit: res.promotionsLimit,
              contractMonths: contractMonths,
              monthlyPlanId: '',
              monthlyPrice: res.price,
              yearlyPlanId: '',
              yearlyPrice: res.price,
              hasTrial: false,
              singlePay: false,
            };

            this.isLoadingCustomPlan = false;
          },
          () => {
            this.isLoadingCustomPlan = false;
          }
        );
    }
  }

  ngOnInit(): void {
    this.stripeForm = this.fb.group({
      address: ['', [Validators.required]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
    });
  }

  close() {
    this.dialogRef.close();
  }

  pay() {
    if (!this.acceptedTerms) {
      this.step = 'terms';
      return;
    }

    if (this.stripeForm.valid) {
      this.step = 'processing';

      this.clearAlerts();
      this.isLoading = true;

      let selectedFrequency = SubscriptionFrequencyEnum.Monthly;

      if (this.frequency == 'monthly') {
        selectedFrequency = SubscriptionFrequencyEnum.Monthly;
      } else if (this.frequency == 'yearly') {
        if (this.selectedPlan.contractMonths == 6) {
          selectedFrequency = SubscriptionFrequencyEnum.HalfYearly;
        } else {
          selectedFrequency = SubscriptionFrequencyEnum.Yearly;
        }
      }

      const planId =
        selectedFrequency == SubscriptionFrequencyEnum.Yearly ||
        selectedFrequency == SubscriptionFrequencyEnum.HalfYearly
          ? this.selectedPlan.yearlyPlanId
          : this.selectedPlan.monthlyPlanId;

      this.stripeService
        .createPaymentMethod({
          type: 'card',
          card: this.card.element,
          billing_details: {
            address: {
              line1: this.stripeForm.get('address').value,
              city: this.stripeForm.get('city').value,
              state: this.stripeForm.get('state').value,
              postal_code: this.stripeForm.get('zip').value,
            },
          },
        })
        .subscribe((res) => {
          if (res.error) {
            this.step = 'card-input';
            this.isLoading = false;
            this.addAlert({ message: res.error.message, type: 'danger' });
            return;
          }

          this.subscriptionService
            .apiSubscriptionSubscribePost({
              subscribeRequestDto: {
                stripePaymentMethodId: res.paymentMethod.id,
                planId: planId || this.customCode,
              },
            })
            .subscribe(
              (res) => {
                this.isLoading = false;
                this.step = 'finalizing';
                this.checkIfSubscribed(res.id, res.planId);
              },
              (err) => {
                this.isLoading = false;
                this.errorHandler(err);
                this.step = 'card-input';
              }
            );
        });
    } else {
      this.step = 'card-input';
    }
  }

  acceptTerms() {
    this.acceptedTerms = true;
    this.pay();
  }

  toggleFrequency() {
    this.frequency = this.frequency === 'monthly' ? 'yearly' : 'monthly';
  }

  checkIfSubscribed(subscriptionId: number, planId: string) {
    this.authService.refreshUser().subscribe((res) => {
      if (
        res.activeSubscriptions.length &&
        res.activeSubscriptions.find(
          (x) => x.id == subscriptionId && x.planId == planId
        )
      ) {
        this.step = 'success';
      } else {
        setTimeout(() => {
          this.checkIfSubscribed(subscriptionId, planId);
        }, 2500);
      }
    });
  }

  finish() {
    this.close();
    this.router.navigate(['/home']);
  }
}
