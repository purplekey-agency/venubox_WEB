import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  apiUrl: string;
  googleApiKey: string;
  stripePublishableKey: string;

  constructor() {}
}
