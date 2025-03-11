import { Component, HostListener, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBroom } from '@fortawesome/free-solid-svg-icons';

import { ChatService } from '../service/chat-service.service';
import { ChatMessage } from '../models/chat.model';
import { selectMessages, selectSessionId } from '../state/chat.selectors';
import { ChatActions } from '../state/chat.actions';
import { ExplorerActions } from '../state/explorer.actions';

@Component({
  selector: 'aichat',
  imports: [CommonModule, FormsModule, ButtonModule, ProgressSpinnerModule, FontAwesomeModule, TooltipModule],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss'
})
export class AichatComponent {
  faBroom = faBroom;
  private store = inject(Store);

  message: string = '';

  messages$: Observable<ChatMessage[]> = this.store.select(selectMessages);
  sessionId$: Observable<string> = this.store.select(selectSessionId);

  public loading: boolean = false;

  constructor(private chatService: ChatService) {
  }

  sendMessage() {
    if (this.message.trim()) {

      this.sessionId$.pipe(take(1)).subscribe(sessionId => {
        const message: ChatMessage = {
          id: uuidv4(),
          sender: 'user',
          text: this.message,
          mappable: false
        };

        this.message = '';

        this.loading = true;

        this.store.dispatch(ChatActions.addMessage(message));

        this.chatService.sendMessage(sessionId, message).then((response) => {
          this.store.dispatch(ChatActions.addMessage(response));
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

        this.chatService.getLocations(history).then((response) => {
          this.store.dispatch(ExplorerActions.setGeoObjects({ objects: response }));
        }).finally(() => {
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
    this.sendMessage();
  }
}
