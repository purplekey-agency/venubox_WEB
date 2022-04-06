import { Component, Input } from '@angular/core';

export interface Alert {
  type: 'success' | 'danger' | 'info' | 'default';
  message: string;
  ref?: string;
}

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
})
export class AlertsComponent {
  @Input() alerts: Alert[] = [];
  @Input() ref: string;
}
