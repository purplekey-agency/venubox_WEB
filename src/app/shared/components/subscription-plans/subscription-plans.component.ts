import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Plan, PlansService } from '../../../services/plans.service';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss'],
})
export class SubscriptionPlansComponent implements OnInit {
  @Output() packageSelected = new EventEmitter<number>();
  @Output() customCodeChanged = new EventEmitter<string>();
  @Output() tabSelected = new EventEmitter<string>();
  @Input() selectedPackage = null;
  activeTab: 'monthly' | 'annual' = 'monthly';
  plans: Plan[] = [];
  customCode = new FormControl();

  constructor(plansService: PlansService) {
    this.plans = plansService.getAll();

    this.customCode.valueChanges.subscribe((res) => {
      if (res) {
        this.packageSelected.emit(null);
      }
      this.customCodeChanged.emit(res);
    });
  }

  ngOnInit() {
    this.tabSelected.emit(this.activeTab);
  }

  selectPackage(id: number) {
    this.customCode.patchValue('');
    this.packageSelected.emit(id);
  }

  setTab(tab: 'monthly' | 'annual') {
    this.activeTab = tab;
    this.tabSelected.emit(tab);
  }
}
