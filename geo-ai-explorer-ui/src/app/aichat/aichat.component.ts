import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEraser,
  faUpRightAndDownLeftFromCenter,
  faUser,
  faPlus,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

import { ChatService } from '../service/chat-service.service';
import { initialState, parseText } from '../state/chat.state';
import { ChatMessage } from '../models/chat.model';
import { ErrorService } from '../service/error-service.service';
import {
  ExplorerActions,
  getWorkflowData,
  getWorkflowStep,
  WorkflowStep
} from '../state/explorer.state';
import { ExplorerService } from '../service/explorer.service';
import { GeoObject } from '../models/geoobject.model';
import { MessageService } from 'primeng/api';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

interface ChatConversation {
  id: string;
  title: string;
  sessionId: string;
  messages: ChatMessage[];
  draft: string;
  loading: boolean;
  createdAt: number;
}

@Component({
  selector: 'aichat',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    FontAwesomeModule,
    TooltipModule
  ],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss'
})
export class AichatComponent {
  private readonly STORAGE_KEY = 'aichat.conversations.v1';
  private readonly ACTIVE_CONVERSATION_STORAGE_KEY = 'aichat.activeConversationId.v1';

  icon = faEraser;
  public newConversationIcon = faPlus;
  public closeConversationIcon = faXmark;

  public messageUserIcon = faUser;
  public messageSenderIcon = faUpRightAndDownLeftFromCenter;

  private store = inject(Store);

  workflowStep$: Observable<WorkflowStep> = this.store.select(getWorkflowStep);
  workflowData$: Observable<any> = this.store.select(getWorkflowData);
  onWorkflowStepChange: Subscription;

  public conversations: ChatConversation[] = [];
  public activeConversationId: string | null = null;

  public mapLoading: boolean = false;
  public minimized: boolean = false;

  public editingConversationId: string | null = null;
  public editingConversationTitle = '';

  constructor(
    private chatService: ChatService,
    private explorerService: ExplorerService,
    private errorService: ErrorService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.loadConversations();

    this.onWorkflowStepChange = combineLatest([
      this.workflowStep$,
      this.workflowData$
    ]).subscribe(([step, data]) => {
      if (step === WorkflowStep.FullScreenChat && data != null) {
        const go = data as GeoObject;
        const conversation = this.activeConversation;

        if (conversation) {
          conversation.draft = go.properties.uri;
          this.saveConversations();
          this.sendMessage();
        }
      }

      this.minimized = step === WorkflowStep.MinimizeChat;
    });
  }

  ngOnDestroy(): void {
    this.onWorkflowStepChange.unsubscribe();
  }

  get activeConversation(): ChatConversation | undefined {
    return this.conversations.find(c => c.id === this.activeConversationId);
  }

  get renderedMessages(): ChatMessage[] {
    const conversation = this.activeConversation;
    return conversation ? [...conversation.messages].reverse() : [];
  }

  get message(): string {
    return this.activeConversation?.draft ?? '';
  }

  set message(value: string) {
    const conversation = this.activeConversation;

    if (conversation) {
      conversation.draft = value;
      this.saveConversations();
    }
  }

  get loading(): boolean {
    return this.activeConversation?.loading ?? false;
  }

  private saveConversations(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.conversations));

      if (this.activeConversationId) {
        localStorage.setItem(this.ACTIVE_CONVERSATION_STORAGE_KEY, this.activeConversationId);
      } else {
        localStorage.removeItem(this.ACTIVE_CONVERSATION_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save AI chat conversations to localStorage', error);
    }
  }

  private loadConversations(): void {
    const rawConversations = localStorage.getItem(this.STORAGE_KEY);
    const rawActiveConversationId = localStorage.getItem(this.ACTIVE_CONVERSATION_STORAGE_KEY);

    if (!rawConversations) {
      this.newDefaultConversation();
      return;
    }

    try {
      const conversations = JSON.parse(rawConversations) as ChatConversation[];

      if (!Array.isArray(conversations) || conversations.length === 0) {
        this.resetStoredConversationsToDefault();
        return;
      }

      this.conversations = conversations.map(c => ({
        id: c.id ?? uuidv4(),
        title: c.title ?? 'New chat',
        sessionId: c.sessionId ?? uuidv4(),
        messages: Array.isArray(c.messages) ? c.messages : [],
        draft: c.draft ?? '',
        loading: false,
        createdAt: c.createdAt ?? Date.now()
      }));

      const hasRealChatHistory = this.conversations.some(c =>
        c.messages.some(m => m.purpose === 'standard') || c.draft.trim().length > 0
      );

      if (!hasRealChatHistory) {
        this.resetStoredConversationsToDefault();
        return;
      }

      const activeStillExists = this.conversations.some(c => c.id === rawActiveConversationId);

      this.activeConversationId = activeStillExists
        ? rawActiveConversationId
        : this.conversations[0].id;

      this.saveConversations();
    } catch (error) {
      console.warn('Failed to load AI chat conversations from localStorage', error);
      this.resetStoredConversationsToDefault();
    }
  }

  private resetStoredConversationsToDefault(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ACTIVE_CONVERSATION_STORAGE_KEY);

    this.conversations = [];
    this.activeConversationId = null;

    this.newDefaultConversation();
  }

  renderMarkdown(text: string | undefined | null): string {
    return marked.parse(text ?? '', {
      breaks: true,
      gfm: true
    }) as string;
  }

  newConversation(save = true): void {
    const id = uuidv4();

    const conversation: ChatConversation = {
      id,
      title: 'New chat',
      sessionId: uuidv4(),
      messages: [],
      draft: '',
      loading: false,
      createdAt: Date.now()
    };

    this.conversations.unshift(conversation);
    this.activeConversationId = id;

    if (save) {
      this.saveConversations();
    }
  }

  private newDefaultConversation(save = true): void {
    const id = uuidv4();

    const conversation: ChatConversation = {
      id,
      title: 'Example chat',
      sessionId: uuidv4(),
      messages: this.createDefaultMessages(),
      draft: '',
      loading: false,
      createdAt: Date.now()
    };

    this.conversations.unshift(conversation);
    this.activeConversationId = id;

    if (save) {
      this.saveConversations();
    }
  }

  selectConversation(id: string): void {
    this.activeConversationId = id;
    this.saveConversations();
  }

  deleteConversation(event: Event, id: string): void {
    event.stopPropagation();

    this.conversations = this.conversations.filter(c => c.id !== id);

    if (this.activeConversationId === id) {
      this.activeConversationId = this.conversations[0]?.id ?? null;
    }

    if (this.conversations.length === 0) {
      this.newConversation(false);
    }

    this.saveConversations();
  }

  startEditingConversationTitle(event: Event, conversation: ChatConversation): void {
    event.stopPropagation();

    this.editingConversationId = conversation.id;
    this.editingConversationTitle = conversation.title;
  }

  saveConversationTitle(event?: Event): void {
    event?.stopPropagation();

    if (!this.editingConversationId) {
      return;
    }

    const conversation = this.conversations.find(c => c.id === this.editingConversationId);

    if (!conversation) {
      this.cancelConversationTitleEdit(event);
      return;
    }

    const trimmed = this.editingConversationTitle.trim();

    conversation.title = trimmed.length > 0
      ? trimmed
      : 'New chat';

    this.editingConversationId = null;
    this.editingConversationTitle = '';

    this.saveConversations();
  }

  cancelConversationTitleEdit(event?: Event): void {
    event?.stopPropagation();

    this.editingConversationId = null;
    this.editingConversationTitle = '';
  }

  private createDefaultMessages(): ChatMessage[] {
    // return [
    //   {
    //     id: uuidv4(),
    //     sender: 'system',
    //     text: 'Ask me a question about the map.',
    //     mappable: false,
    //     sections: [
    //       {
    //         type: 0,
    //         text: 'Ask me a question about the map.'
    //       }
    //     ],
    //     loading: false,
    //     purpose: 'info'
    //   },
    //   {
    //     id: uuidv4(),
    //     sender: 'system',
    //     text: 'For example: “Show me levees near Denver” or “Find pump stations in this area.”',
    //     mappable: false,
    //     sections: [
    //       {
    //         type: 0,
    //         text: 'For example: “Show me levees near Denver” or “Find pump stations in this area.”'
    //       }
    //     ],
    //     loading: false,
    //     purpose: 'info'
    //   }
    // ];

    return initialState.messages;
  }

  private updateConversationTitle(conversation: ChatConversation, text: string): void {
    if (conversation.title !== 'New chat') {
      return;
    }

    const trimmed = text.trim();

    conversation.title = trimmed.length > 28
      ? trimmed.substring(0, 28) + '...'
      : trimmed;
  }

  private normalizeResponseSections(response: any): any[] {
    if (Array.isArray(response.sections)) {
      return response.sections;
    }

    return [{ type: 0, text: response.text ?? '' }];
  }

  sendMessage(): void {
    const conversation = this.activeConversation;

    if (!conversation || conversation.loading || !conversation.draft.trim()) {
      return;
    }

    if (this.minimized) {
      this.minimizeChat();
    }

    const text = conversation.draft.trim();

    const message: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text,
      mappable: false,
      sections: [{ type: 0, text }],
      loading: false,
      purpose: 'standard'
    };

    conversation.draft = '';
    conversation.messages.push(message);
    this.updateConversationTitle(conversation, text);

    const system: ChatMessage = {
      id: uuidv4(),
      sender: 'system',
      text: '',
      mappable: false,
      sections: [],
      loading: true,
      purpose: 'standard'
    };

    conversation.messages.push(system);
    conversation.loading = true;

    this.saveConversations();

    const conversationId = conversation.id;
    const systemMessageId = system.id;
    const sessionId = conversation.sessionId;

    this.chatService.sendMessage(sessionId, message)
      .then(response => {
        const targetConversation = this.conversations.find(c => c.id === conversationId);

        if (!targetConversation) {
          return;
        }

        const index = targetConversation.messages.findIndex(m => m.id === systemMessageId);

        if (index !== -1) {

          targetConversation.messages[index] = parseText({
            ...system,
            text: response.text,
            sections: this.normalizeResponseSections(response),
            mappable: response.mappable,
            ambiguous: response.ambiguous,
            loading: false,
            location: response.location
          });

          this.saveConversations();
        }
      })
      .catch(error => {
        this.errorService.handleError(error);

        const targetConversation = this.conversations.find(c => c.id === conversationId);

        if (!targetConversation) {
          return;
        }

        const index = targetConversation.messages.findIndex(m => m.id === systemMessageId);

        if (index !== -1) {
          targetConversation.messages[index] = {
            ...system,
            text: 'An error occurred',
            sections: [{ type: 0, text: 'An error occurred' }],
            loading: false,
            purpose: 'info'
          };

          this.saveConversations();
        }
      })
      .finally(() => {
        const targetConversation = this.conversations.find(c => c.id === conversationId);

        if (targetConversation) {
          targetConversation.loading = false;
          this.saveConversations();
        }
      });
  }

  minimizeChat(): void {
    if (!this.minimized) {
      this.store.dispatch(ExplorerActions.setWorkflowStep({ step: WorkflowStep.MinimizeChat }));
      this.minimized = true;
    } else {
      this.store.dispatch(ExplorerActions.setWorkflowStep({ step: WorkflowStep.MapAndResults }));
      this.minimized = false;
    }
  }

  askNewQuestion(): void {
    this.newConversation();
  }

  mapIt(message: ChatMessage): void {
    const conversation = this.activeConversation;

    if (!conversation) {
      return;
    }

    const index = conversation.messages.findIndex(m => m.id === message.id);

    if (index === -1) {
      return;
    }

    const history = conversation.messages
      .slice(0, index + 1)
      .filter(m => m.purpose === 'standard');

    this.mapLoading = true;

    this.chatService.getLocations(history, 0, 100)
      .then(pages => {
        let total = pages.map(p => p.count).reduce((a,b) => a+b, 0);

        if (total === 0) {
          this.messageService.add({
            key: 'explorer',
            severity: 'info',
            summary: 'Info',
            detail: 'The query did not return any results!',
            sticky: true
          });
          return;
        }

        const step = message.ambiguous
          ? WorkflowStep.DisambiguateObject
          : WorkflowStep.MapAndResults;

        this.store.dispatch(ExplorerActions.showPagesOnMap({
          pages,
          zoomMap: true,
          step,
          data: { pages, zoomMap: true }
        }));
      })
      .catch(error => this.errorService.handleError(error))
      .finally(() => {
        this.mapLoading = false;
      });
  }

  setWorkflowStepDisambiguate(message: ChatMessage): void {
    this.mapLoading = true;

    this.explorerService.fullTextLookup(message.location!)
      .then(page => {
        this.store.dispatch(ExplorerActions.setPages({
          pages: [page],
          zoomMap: true
        }));

        this.store.dispatch(ExplorerActions.selectGeoObject(null));

        this.store.dispatch(ExplorerActions.setWorkflowStep({ step: WorkflowStep.DisambiguateObject }));
      })
      .catch(error => this.errorService.handleError(error))
      .finally(() => {
        this.mapLoading = false;
      });
  }

  clear(): void {
    const conversation = this.activeConversation;

    this.store.dispatch(ExplorerActions.setPages({
      pages: [{
        locations: [],
        statement: '',
        type: '',
        limit: 100,
        offset: 0,
        count: 0
      }],
      zoomMap: false
    }));

    if (conversation) {
      conversation.messages = [];
      conversation.sessionId = uuidv4();
      conversation.draft = '';
      conversation.title = 'New chat';
      conversation.loading = false;
    }

    this.saveConversations();
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    if (!this.loading) {
      this.sendMessage();
    }
  }

  select(event: Event, uri: string): void {
    event.stopPropagation();
    this.mapLoading = true;

    this.explorerService.getAttributes(uri, true)
      .then(geoObject => {
        this.store.dispatch(ExplorerActions.setWorkflowStep({ step: WorkflowStep.InspectObject, data: geoObject }));
        this.store.dispatch(ExplorerActions.selectGeoObject({ object: geoObject, zoomMap: true }));
      })
      .catch(error => this.errorService.handleError(error))
      .finally(() => {
        this.mapLoading = false;
      });
  }
}