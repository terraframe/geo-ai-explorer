import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LetDirective } from '@ngrx/component';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { ExplorerActions, getPage, getWorkflowStep, highlightedObject, selectedObject, WorkflowStep } from '../state/explorer.state';
import { ChatService } from '../service/chat-service.service';
import { LocationPage } from '../models/chat.model';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'results-table',
    imports: [TableModule, PaginatorModule, LetDirective, CommonModule, FontAwesomeModule],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss',
})
export class ResultsTableComponent implements OnInit, OnDestroy {
    public WorkflowStep = WorkflowStep;
    private store = inject(Store);

    page$: Observable<LocationPage> = this.store.select(getPage);

    selectedObject$: Observable<GeoObject | null> = this.store.select(selectedObject);

    highlightedObject$: Observable<GeoObject | null> = this.store.select(highlightedObject);

    onHighlightedObjectChange: Subscription;

    public highlightedObjectUri: string | null | undefined;

    workflowStep$: Observable<WorkflowStep> = this.store.select(getWorkflowStep);
    
    onWorkflowStepChange: Subscription;

    public workflowStep: WorkflowStep = WorkflowStep.AiChatAndResults;

    constructor(
        private chatService: ChatService
    ) {
        this.onHighlightedObjectChange = this.highlightedObject$.subscribe(object => {
            this.highlightObject(object == null ? undefined : object.properties.uri);
        });

        this.onWorkflowStepChange = this.workflowStep$.subscribe(step => {
            this.workflowStep = step;
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }

    calculateScrollHeight(): string {
        if (this.workflowStep == WorkflowStep.DisambiguateObject) {
            return "calc(100vh - 75px)"
        } else if (this.workflowStep === WorkflowStep.MinimizeChat) {
            // return "calc(100vh - 50px)";
            return "calc(100vh - 108px)";
        } else {
            return "calc(50vh - 3rem)";
        }
    }

    onClick(obj: GeoObject): void {
        this.store.dispatch(ExplorerActions.selectGeoObject({ object: obj, zoomMap: true }));
    }

    onRowHover(obj: GeoObject): void {
        this.store.dispatch(ExplorerActions.highlightGeoObject({ object: obj }));
    }

    onMouseLeaveTable(): void {
        this.highlightedObjectUri = null;
    }

    highlightObject(uri?: string): void {
        this.highlightedObjectUri = uri;
    }

    onPageChange(state: PaginatorState): void {

        this.page$.pipe(take(1)).subscribe(page => {
            this.chatService.getPage(page.statement, state.first!, state.rows!).then(page => {
                this.store.dispatch(ExplorerActions.setPage({
                    page,
                    zoomMap: true
                }));
            })
        })

    }
}
