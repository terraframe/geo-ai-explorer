import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {

  constructor(private messageService: MessageService) {
  }


  handleError(response: HttpErrorResponse) {
    if (response.status === 0) {
      this.messageService.add({
        key: 'explorer',
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to communicate with the server',
        sticky: true
      })
    }
    else if (response.status === 400 || response.status === 500) {

      let message = 'Your request failed to complete';

      if (typeof response.error === 'string' && response.error !== null) {
        message = response.error;
      }
      else if (typeof response.error === 'object' && response.error !== null) {
        message = response.error.error;
      }

      this.messageService.add({
        key: 'explorer',
        severity: 'error',
        summary: 'Error',
        detail: message,
        sticky: true

      })
    }

  }

}