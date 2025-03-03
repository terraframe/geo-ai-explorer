import { Component, HostListener, Input } from '@angular/core';
import { ChatService, ChatMessage } from '../chat-service.service';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ExplorerComponent } from '../explorer/explorer.component';

@Component({
    selector: 'aichat',
    imports: [CommonModule, FormsModule, ButtonModule, ProgressSpinnerModule],
    templateUrl: './aichat.component.html',
    styleUrl: './aichat.component.scss'
})
export class AichatComponent {
  @Input() explorer!: ExplorerComponent;

  message: string = '';
  messages: ChatMessage[] = [];

  public loading:boolean = false;

  constructor(private chatService: ChatService) {
    this.refreshMessages();
  }

  sendMessage() {
    if (this.message.trim()) {
      const message: ChatMessage = { sender: 'user', text: this.message, mappable: false };
      this.message = '';

      this.loading = true;
      this.chatService.sendChat(message).then((response) => {
        this.refreshMessages();
      }).finally(() => {
        this.loading = false;
      })
    }
  }

  refreshMessages() {
    this.messages = [...this.chatService.getMessages()].reverse();
  }

  mapIt(message: ChatMessage) {
    this.explorer.loadTestQuery(1);
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    this.sendMessage();
  }
}
