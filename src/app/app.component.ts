import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { ChatMessageDto } from './backend';
import { I18nService } from './core/services/i18n.service';
import { SignalrService } from './core/services/signalr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private i18n: I18nService,
    signalrService: SignalrService,
    toastr: ToastrService,
    router: Router
  ) {
    signalrService.initialize();
    signalrService.signalrConnection.on(
      'NewMessage',
      (message: ChatMessageDto) => {
        if (!router.url.includes('chat')) {
          toastr
            .info(message.content, 'New message received')
            .onTap.pipe(take(1))
            .subscribe(() => {
              router.navigate([`/chat`], {
                queryParams: { id: message.chatId },
              });
            });
        }
      }
    );
  }

  useLanguage(language: 'en') {
    this.i18n.setLanguage(language);
  }
}
