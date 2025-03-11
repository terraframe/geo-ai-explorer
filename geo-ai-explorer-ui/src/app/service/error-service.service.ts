import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {

  constructor(private messageService: MessageService) {
  }


  handleError(error: any) {
    if (error.status === 0) {
      this.messageService.add({
        key: 'explorer',
        severity: "danger",
        summary: 'Error',
        detail: 'Unable to communicate with the server',
        sticky: true
      })
    }
    else if (error.status === 400) {

      const message = error.error != null ? error.error : 'Your request failed to complete'

      this.messageService.add({
        key: 'explorer',
        severity: "danger",
        summary: 'Error',
        detail: message,
        sticky: true

      })
    }

  }

}