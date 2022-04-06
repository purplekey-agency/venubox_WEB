import { Injectable } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

export interface Plan {
  id: number;
  name: string;
  description: string;
  brandIdentitiesLimit: number;
  contactIdentitiesLimit: number;
  geofencesLimit: number;
  activePromotionsLimit: number;
  contractMonths: number;
  monthlyPlanId: string;
  monthlyPrice: number;
  yearlyPlanId: string;
  yearlyPrice: number;
  hasTrial: boolean;
  singlePay: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  plans: Plan[] = [
    {
      id: 1,
      name: 'SEASONAL Package',
      description: 'Suitable for single venues and provides the following:',
      brandIdentitiesLimit: 2,
      contactIdentitiesLimit: 2,
      geofencesLimit: 2,
      activePromotionsLimit: 3,
      contractMonths: 6,
      monthlyPlanId: 'plan_seasonal_monthly',
      monthlyPrice: 99,
      yearlyPlanId: 'plan_seasonal_halfyearly',
      yearlyPrice: 500,
      hasTrial: false,
      singlePay: false,
    },
    {
      id: 2,
      name: 'PREMIUM Package',
      description: 'Suitable for multiple venues and provides the following:',
      brandIdentitiesLimit: 4,
      contactIdentitiesLimit: 4,
      geofencesLimit: 6,
      activePromotionsLimit: 8,
      contractMonths: 12,
      monthlyPlanId: 'plan_premium_monthly',
      monthlyPrice: 129,
      yearlyPlanId: 'plan_premium_yearly',
      yearlyPrice: 1300,
      hasTrial: true,
      singlePay: false,
    },
    {
      id: 3,
      name: 'PLATINUM Package',
      description: 'Suitable for up to 5 venues and provides the following:',
      brandIdentitiesLimit: 12,
      contactIdentitiesLimit: 12,
      geofencesLimit: 25,
      activePromotionsLimit: 40,
      contractMonths: 12,
      monthlyPlanId: 'plan_platinum_monthly',
      monthlyPrice: 499,
      yearlyPlanId: 'plan_platinum_yearly',
      yearlyPrice: 5000,
      hasTrial: false,
      singlePay: false,
    },
    {
      id: 4,
      name: 'PAYG Promoter Package',
      description: 'Suitable for single venues and provides the following:',
      brandIdentitiesLimit: 1,
      contactIdentitiesLimit: 1,
      geofencesLimit: 1,
      activePromotionsLimit: 1,
      contractMonths: 0,
      monthlyPlanId: 'plan_payg',
      monthlyPrice: 49,
      yearlyPlanId: 'plan_payg',
      yearlyPrice: 49,
      hasTrial: false,
      singlePay: true,
    },
  ];

  constructor(private authService: AuthService) {
    const user = authService.getUser();

    if (user && user.hasBeenSubscribed) {
      const newPlans = this.plans;
      newPlans.forEach((x) => (x.hasTrial = false));
      this.plans = newPlans;
    }
  }

  getAll() {
    return this.plans;
  }

  getById(id: number): Plan | null {
    return this.plans.find((x) => x.id == id);
  }
}
