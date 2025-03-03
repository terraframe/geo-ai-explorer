import { Component, HostListener } from '@angular/core';
import { ChatService } from '../chat-service.service';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aichat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss'
})
export class AichatComponent {
  message: string = '';
  messages: { sender: string; text: string }[] = [];
  currentUser: 'user' | 'system' = 'user';

  constructor(private chatService: ChatService) {
    this.refreshMessages();
  }

  sendMessage() {
    if (this.message.trim()) {
      this.chatService.addMessage({ sender: this.currentUser, text: this.message });
      this.message = '';
      this.refreshMessages();
    }
  }

  refreshMessages() {
    this.messages = [...this.chatService.getMessages()];
  }

  mapIt(message: string) {
    console.log("Mapping triggered for:", message);
    // Implement mapping logic here
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    this.sendMessage();
  }
}
