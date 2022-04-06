import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import * as signalR from '@microsoft/signalr';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ChatsService } from '../../backend/api/chats.service';
import { IdentitiesService } from '../../backend/api/identities.service';
import { ChatMessageDtoPagedResponse } from '../../backend/model/chatMessageDtoPagedResponse';
import { ChatResponseDto } from '../../backend/model/chatResponseDto';
import { BasePagedComponent } from '../../core/components/base-paged/base-paged.component';
import { DialogService } from '../../core/dialog/dialog.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';
import { ConfirmDialogComponent } from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { ChatMessageDto } from './../../backend/model/chatMessageDto';
import { UserIdentityImageResponseDto } from './../../backend/model/userIdentityImageResponseDto';
import { UserIdentityImageType } from './../../backend/model/userIdentityImageType';
import { SignalrService } from './../../core/services/signalr.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent extends BasePagedComponent implements OnInit {
  chats: ChatResponseDto[] = [];
  chat: ChatResponseDto = null;
  chatMessages: ChatMessageDtoPagedResponse = null;

  isLoadingChats = false;
  isLoadingChat = false;
  isLoadingChatMessages = false;
  isLoadingIdentities = false;

  signalrConnection: signalR.HubConnection | null = null;
  messageControl = new FormControl('');
  myUserId = 0;

  identities: UserIdentityImageResponseDto[] = [];
  selectedIdentity = 0;

  @ViewChild('chatBoxMessages')
  chatBoxMessages: ElementRef<HTMLElement>;

  @ViewChild('chatBoxMessagesInner')
  chatBoxMessagesInner: ElementRef<HTMLElement>;

  chatFooterAction: 'emoji' | 'gif' = null;

  @ViewChild('chatActionView') chatActionView;
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    if (this.chatActionView) {
      const clickedInside =
        this.chatActionView.nativeElement.contains(targetElement);

      if (
        !clickedInside &&
        !targetElement.matches('.chat-box-footer-actions *')
      ) {
        this.chatFooterAction = null;
      }
    }
  }

  constructor(
    private chatService: ChatsService,
    private authService: AuthService,
    private config: ConfigService,
    private t: TranslateService,
    private identitiesService: IdentitiesService,
    private dialogService: DialogService,
    private chatsService: ChatsService,
    private signalrService: SignalrService
  ) {
    super(authService, t);
    this.myUserId = this.authService.getUser().id;
    this.signalrConnection = this.signalrService.signalrConnection;
  }

  ngOnInit() {
    this.loadIdentities();
    this.connectSignalR();
  }

  connectSignalR() {
    this.signalrConnection.on('NewMessage', (message: ChatMessageDto) => {
      if (message.chatId === this.chat?.id) {
        this.signalrConnection?.send('MarkChatAsRead', message.chatId);
        this.chatMessages.results.push(message);

        setTimeout(() => {
          this.chatBoxMessages.nativeElement.scrollTo({
            top: this.chatBoxMessagesInner.nativeElement.scrollHeight,
          });
        }, 100);

        const foundChat = this.chats.find((x) => x.id == message.chatId);
        foundChat.lastMessage = message;
        this.findMyUser(foundChat).lastRead = new Date().toISOString();
      } else {
        const foundChat = this.chats.find((x) => x.id == message.chatId);

        if (foundChat) {
          foundChat.lastMessage = message;
        } else {
          this.chatsService
            .apiChatsIdGet({ id: message.chatId })
            .subscribe((res) => {
              this.chats.push({
                ...res,
                lastMessage: message,
              });

              this.sortChats();
            });
        }
      }

      this.sortChats();
    });

    this.signalrConnection.on(
      'MessageDeleted',
      (chatId: number, messageId: number) => {
        if (chatId === this.chat?.id) {
          const foundIndex = this.chatMessages.results.findIndex(
            (x) => x.id == messageId
          );

          if (foundIndex !== -1) {
            this.chatMessages.results.splice(foundIndex, 1);
          }
        }
      }
    );
  }

  sortChats() {
    this.chats = this.chats
      .filter((x) => x.lastMessage)
      .sort(function (a, b) {
        var c = new Date(a.lastMessage?.createdOn);
        var d = new Date(b.lastMessage?.createdOn);

        return d.valueOf() - c.valueOf();
      });
  }

  loadIdentities() {
    this.isLoadingIdentities = true;

    this.identitiesService
      .apiIdentitiesGet({ type: UserIdentityImageType.Contact })
      .subscribe(
        (res) => {
          this.identities = res;
          this.isLoadingIdentities = false;
        },
        () => {
          this.isLoadingIdentities = false;
        }
      );
  }

  selectIdentity(id: number) {
    this.selectedIdentity = id;
    this.loadChats();
  }

  loadChats() {
    this.isLoadingChats = true;

    this.chat = null;
    this.chats = [];

    this.messageControl.setValue('');

    this.chatService
      .apiChatsGet({
        pageSize: 10000,
        filter: JSON.stringify({ contactIdentityId: [this.selectedIdentity] }),
      })
      .subscribe(
        (res) => {
          this.isLoadingChats = false;
          this.chats = res.results;
        },
        (err) => {
          this.isLoadingChats = false;
        }
      );
  }

  loadChat(id: number) {
    if (this.chat && this.chat.id === id) {
      return;
    }

    this.isLoadingChat = true;

    this.chatService.apiChatsIdGet({ id }).subscribe(
      (res) => {
        this.isLoadingChat = false;
        this.chat = res;

        this.loadChatMessages();
      },
      (err) => {
        this.isLoadingChat = false;
      }
    );
  }

  loadChatMessages(loadMore = false) {
    this.isLoadingChatMessages = true;
    const page = loadMore ? this.tableData.page + 1 : 1;

    this.chatService
      .apiChatsIdMessagesGet({ id: this.chat.id, page })
      .subscribe(
        (res) => {
          if (page === 1) {
            const chat = this.chats.find((x) => x.id === this.chat.id);
            const myChatUser = chat.users.find(
              (x) => x.userId == this.myUserId
            );
            myChatUser.lastRead = new Date().toISOString();
          }

          const previousScrollHeight =
            this.chatBoxMessagesInner.nativeElement.scrollHeight;

          this.pageLoaded(res);

          this.isLoadingChatMessages = false;
          const currentMessages = JSON.parse(
            JSON.stringify(this.chatMessages?.results || [])
          );
          this.chatMessages = res;

          if (page > 1) {
            this.chatMessages.results = [
              ...res.results.reverse(),
              ...currentMessages,
            ];
          } else {
            this.chatMessages.results = this.chatMessages.results.reverse();
          }

          setTimeout(() => {
            const scrollHeight =
              this.chatBoxMessagesInner.nativeElement.scrollHeight;

            if (page > 1) {
              this.chatBoxMessages.nativeElement.scrollTo({
                top: scrollHeight - previousScrollHeight,
              });
            } else {
              this.chatBoxMessages.nativeElement.scrollTo({
                top: scrollHeight,
              });
            }
          }, 100);
        },
        () => {
          this.isLoadingChatMessages = false;
        }
      );
  }

  findMyUser(chat: ChatResponseDto) {
    const user = this.authService.getUser();
    const userId = user.id;

    return chat.users.find((x) => x.userId === userId);
  }

  findOtherUser(chat: ChatResponseDto) {
    const user = this.authService.getUser();
    const userId = user.id;

    return chat.users.find((x) => x.userId != userId);
  }

  isUnread(chat: ChatResponseDto) {
    if (chat.lastMessage) {
      const lastRead = this.findMyUser(chat)?.lastRead;

      if (!lastRead) {
        return true;
      }

      return lastRead < chat.lastMessage.createdOn;
    }

    return false;
  }

  formatTimestamp(date: Date) {
    return moment.utc(date).fromNow();
  }

  formatFullTimestamp(date: Date) {
    return moment.utc(date).local().format('LLL');
  }

  formatDateTimestamp(date: Date) {
    return moment.utc(date).format('LL');
  }

  isSameDay(date1: string, date2: string) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  sendMessage() {
    const message = this.messageControl.value?.trim();

    if (!message) {
      return;
    }

    this.signalrConnection
      ?.send('SendMessage', {
        chatId: this.chat?.id,
        content: message,
      })
      .then(
        () => {
          this.messageControl.reset();
        },
        () => {
          // error
        }
      );
  }

  setChatAction(action: 'emoji' | 'gif') {
    this.chatFooterAction = action;
  }

  addEmoji(e: EmojiEvent) {
    const currMessage = this.messageControl.value;

    this.messageControl.patchValue(
      (currMessage ? this.messageControl.value + ' ' : '') + e.emoji.native
    );

    this.chatFooterAction = null;
  }

  gifSelected(url: string) {
    this.chatFooterAction = null;

    this.signalrConnection
      ?.send('SendMessage', {
        chatId: this.chat?.id,
        urls: [url],
      })
      .then(
        () => {
          // this.messageControl.reset();
        },
        () => {
          // error
        }
      );
  }

  deleteMessage(messageId: number) {
    this.dialogService
      .open(ConfirmDialogComponent, {})
      .afterClosed.subscribe((res) => {
        if (res?.confirmed) {
          this.chatsService
            .apiChatsIdMessagesMessageIdDelete({ id: this.chat.id, messageId })
            .subscribe((res) => {
              const foundIndex = this.chatMessages.results.findIndex(
                (x) => x.id == messageId
              );

              if (foundIndex !== -1) {
                this.chatMessages.results.splice(foundIndex, 1);
                this.signalrConnection
                  ?.send('ChatMessageDeleted', this.chat.id, messageId)
                  .then(() => {});
              }
            });
        }
      });
  }
}
