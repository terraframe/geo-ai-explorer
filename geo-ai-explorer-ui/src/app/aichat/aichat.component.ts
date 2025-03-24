import { Component, HostListener, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Store } from '@ngrx/store';
import { Observable, Subscription, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEraser } from '@fortawesome/free-solid-svg-icons';

import { ChatService } from '../service/chat-service.service';
import { ChatMessage } from '../models/chat.model';
import { ChatActions, getMessages, getSessionId } from '../state/chat.state';
import { ErrorService } from '../service/error-service.service';
import { ExplorerActions } from '../state/explorer.state';
import { ExplorerService } from '../service/explorer.service';

@Component({
  selector: 'aichat',
  imports: [CommonModule, FormsModule, ButtonModule, ProgressSpinnerModule, FontAwesomeModule, TooltipModule],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss'
})
export class AichatComponent {
  icon = faEraser;
  private store = inject(Store);

  message: string = '';

  messages$: Observable<ChatMessage[]> = this.store.select(getMessages);
  sessionId$: Observable<string> = this.store.select(getSessionId);

  onMessagesChange: Subscription;

  public loading: boolean = false;

  public renderedMessages: ChatMessage[] = [];

  constructor(
    private chatService: ChatService,
    private explorerService: ExplorerService,
    private errorService: ErrorService) {
    this.onMessagesChange = this.messages$.subscribe(messages => {
      this.renderedMessages = [...messages].reverse();
    });
  }

  sendMessage() {
    if (this.message.trim()) {

      this.sessionId$.pipe(take(1)).subscribe(sessionId => {
        const message: ChatMessage = {
          id: uuidv4(),
          sender: 'user',
          text: this.message,
          mappable: false,
          sections: [{ type: 0, text: this.message }],
          loading: false
        };

        this.message = '';

        this.store.dispatch(ChatActions.addMessage(message));

        const system: ChatMessage = {
          id: uuidv4(),
          sender: 'system',
          text: '',
          mappable: false,
          sections: [],
          loading: true
        };

        this.store.dispatch(ChatActions.addMessage(system));

        this.loading = true;

        this.chatService.sendMessage(sessionId, message).then((response) => {
          this.store.dispatch(ChatActions.updateMessage({
            ...system,
            text: response.text,
            mappable: response.mappable,
            loading: false
          }));
        }).catch(error => {
          this.errorService.handleError(error)

          this.store.dispatch(ChatActions.updateMessage({
            ...system,
            text: 'An error occurred',
            loading: false
          }));

        }).finally(() => {
          this.loading = false;
        })
      });
    }
  }

  mapIt(message: ChatMessage) {
    this.messages$.pipe(take(1)).subscribe(messages => {

      const index = messages.findIndex(m => m.id === message.id);

      if (index !== -1) {
        const history = [...messages];
        history.splice(index);

        this.loading = true;

        this.chatService.getLocations(history, 0, 100).then((page) => {

          this.store.dispatch(ExplorerActions.setPage({
            page,
            zoomMap: true
          }));

        }).catch(error => this.errorService.handleError(error)).finally(() => {
          this.loading = false;
        })
      }
    });
  }

  clear(): void {
    this.store.dispatch(ChatActions.setMessageAndSession({ messages: [], sessionId: uuidv4() }));
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    if (!this.loading) {
      this.sendMessage();
    }
  }

  select(uri: string): void {

    this.explorerService.getAttributes(uri)
      .then(geoObject => {
        this.store.dispatch(ExplorerActions.selectGeoObject({ object: geoObject, zoomMap: true }));
      })
      .catch(error => this.errorService.handleError(error))
  }
}
