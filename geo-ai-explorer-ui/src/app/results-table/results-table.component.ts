import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LetDirective } from '@ngrx/component';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { ExplorerActions, getPages, getWorkflowStep, highlightedObject, selectedObject, WorkflowStep } from '../state/explorer.state';
import { ChatService } from '../service/chat-service.service';
import { LocationPage } from '../models/chat.model';
import { faArrowLeft, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'results-table',
    imports: [TableModule, PaginatorModule, LetDirective, CommonModule, FontAwesomeModule, ButtonModule, FormsModule, MultiSelectModule],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss',
})
export class ResultsTableComponent implements OnInit, OnDestroy {
    public WorkflowStep = WorkflowStep;
    private store = inject(Store);

    public backIcon = faArrowLeft;

    pages$: Observable<LocationPage[]> = this.store.select(getPages);

    selectedObject$: Observable<GeoObject | null> = this.store.select(selectedObject);

    highlightedObject$: Observable<GeoObject | null> = this.store.select(highlightedObject);

    onHighlightedObjectChange: Subscription;

    public highlightedObjectUri: string | null | undefined;

    workflowStep$: Observable<WorkflowStep> = this.store.select(getWorkflowStep);
    
    onWorkflowStepChange: Subscription;

    public workflowStep: WorkflowStep = WorkflowStep.MapAndResults;

    pageDisplayOptions: { label: string; value: string }[] = [];
    selectedPageDisplayKeys: string[] = [];

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

    navigateToChat() {
        this.store.dispatch(ExplorerActions.setPages({ pages: [{ 
            locations: [],
            statement: "",
            type: "",
            limit: 100,
            offset: 0,
            count: 0
        }], zoomMap: false }));
        this.store.dispatch(ExplorerActions.setWorkflowStep({ step: WorkflowStep.FullScreenChat }));
    }

    goBack() {
        this.store.dispatch(ExplorerActions.backWorkflowStep());
        this.store.dispatch(ExplorerActions.selectGeoObject(null));
    }

    calculateScrollHeight(): string {
        if (this.workflowStep == WorkflowStep.DisambiguateObject) {
            return "calc(100vh - 75px)"
        } else if (this.workflowStep === WorkflowStep.MinimizeChat) {
            // return "calc(100vh - 50px)";
            return "calc(100vh - 108px)";
        } else {
            return "calc(40vh - 3rem)";
        }
    }

    onClick(obj: GeoObject): void {
        this.store.dispatch(ExplorerActions.appendWorkflowStep({ step: WorkflowStep.InspectObject, data: obj }));
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

    onPageChange(state: PaginatorState, pageIndex: number): void {
        this.pages$.pipe(take(1)).subscribe(pages => {
            const currentPage = pages[pageIndex];

            if (!currentPage) {
                return;
            }

            this.chatService
                .getPage(currentPage.statement, currentPage.type, state.first ?? 0, state.rows ?? currentPage.limit)
                .then(nextPage => {
                    const nextPages = [...pages];
                    nextPages[pageIndex] = nextPage;

                    this.store.dispatch(ExplorerActions.setPages({
                    pages: nextPages,
                    zoomMap: true
                    }));
                });
        });
    }

    getVisiblePageItems(pages: LocationPage[] | null | undefined): { page: LocationPage; index: number }[] {
        if (!pages?.length) {
            return [];
        }

        this.syncPageDisplayOptions(pages);

        return pages
            .map((page, index) => ({ page, index }))
            .filter(item => item.page.count > 0)
            .filter(item => this.selectedPageDisplayKeys.includes(this.getPageDisplayKey(item.page, item.index)));
    }

    trackByPageItem = (index: number, item: { page: LocationPage; index: number }): string | number => {
        return this.getPageDisplayKey(item.page, item.index);
    }

    private syncPageDisplayOptions(pages: LocationPage[]): void {
        const nextOptions = pages
            .map((page, index) => ({
            label: this.getPageDisplayLabel(page, index),
            value: this.getPageDisplayKey(page, index)
            }));

        const nextKeys = nextOptions.map(option => option.value);

        const optionsChanged =
            this.pageDisplayOptions.length !== nextOptions.length ||
            this.pageDisplayOptions.some((option, index) => option.value !== nextOptions[index]?.value);

        if (optionsChanged) {
            this.pageDisplayOptions = nextOptions;

            const stillSelected = this.selectedPageDisplayKeys.filter(key => nextKeys.includes(key));

            this.selectedPageDisplayKeys = stillSelected.length > 0
            ? stillSelected
            : nextKeys;
        }
    }

    public getPageDisplayKey(page: LocationPage, index: number): string {
        return page.type?.trim()
            ? page.type
            : `page-${index}`;
    }

    private getPageDisplayLabel(page: LocationPage, index: number): string {
        const typeLabel = this.getPageTypeLabel(page);

        return typeLabel && typeLabel !== 'Unknown'
            ? typeLabel
            : `Results ${index + 1}`;
    }

    hasResults(pages: LocationPage[] | null | undefined): boolean {
        return !!pages?.some(page => page.count > 0);
    }

    shouldShowTypeColumn(page: LocationPage): boolean {
        return page.type == null || page.type.trim() === '';
    }

    getPageTypeLabel(page: LocationPage): string {
        return this.getTypeLabel(page.type);
    }

    getObjectTypeLabel(object: GeoObject): string {
        return this.getTypeLabel(object.properties.type);
    }

    private getTypeLabel(type: string | null | undefined): string {
        if (type == null || type.trim() === '') {
            return 'Unknown';
        }

        return type.includes('rdfs#')
            ? type.split('rdfs#')[1]
            : type;
    }
}
