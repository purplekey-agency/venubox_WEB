import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  signalrConnection: signalR.HubConnection | null = null;

  constructor(
    private authService: AuthService,
    private config: ConfigService
  ) {}

  initialize() {
    if (this.signalrConnection) {
      this.signalrConnection.stop();
      this.signalrConnection = null;
    }

    const token = this.authService.getToken();

    this.signalrConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.config.apiUrl}/hubs/chat?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.signalrConnection.start().then(() => {
      // console.log('SignalR Connected');
    });
  }
}
