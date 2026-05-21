import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LetDirective } from '@ngrx/component';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { ExplorerActions, getPages, getWorkflowStep, highlightedObject, WorkflowStep } from '../state/explorer.state';
import { ChatService } from '../service/chat-service.service';
import { LocationPage } from '../models/chat.model';
import { faArrowLeft, faArrowUp, faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';

interface PageDisplayItem {
  page: LocationPage;
  index: number;
}

@Component({
    selector: 'results-table',
    imports: [TableModule, PaginatorModule, LetDirective, CommonModule, FontAwesomeModule, ButtonModule, FormsModule, MultiSelectModule, TooltipModule, TabsModule],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss',
})
export class ResultsTableComponent implements OnInit, OnDestroy {
    public WorkflowStep = WorkflowStep;
    private store = inject(Store);

    public backIcon = faArrowLeft;
    pinIcon = faThumbtack;

    pages$: Observable<LocationPage[]> = this.store.select(getPages);

    highlightedObject$: Observable<GeoObject | null> = this.store.select(highlightedObject);

    onHighlightedObjectChange: Subscription;

    public highlightedObjectUri: string | null | undefined;

    workflowStep$: Observable<WorkflowStep> = this.store.select(getWorkflowStep);
    
    onWorkflowStepChange: Subscription;
    onPagesChange: Subscription;

    public workflowStep: WorkflowStep = WorkflowStep.MapAndResults;

    private latestPages: LocationPage[] = [];
    pageDisplayOptions: { label: string; value: string }[] = [];
    displayedPageItems: PageDisplayItem[] = [];
    
    maxPinnedPages = 3;

    activePageDisplayKey: string = '';
    pinnedPageDisplayKeys: string[] = [];

    constructor(
        private chatService: ChatService
    ) {
        this.onHighlightedObjectChange = this.highlightedObject$.subscribe(object => {
            this.highlightObject(object == null ? undefined : object.properties.uri);
        });

        this.onWorkflowStepChange = this.workflowStep$.subscribe(step => {
            this.workflowStep = step;
        });

        this.onPagesChange = this.pages$.subscribe(pages => {
            this.latestPages = pages ?? [];
            this.rebuildPageDisplayState();
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.onHighlightedObjectChange?.unsubscribe();
        this.onWorkflowStepChange?.unsubscribe();
        this.onPagesChange?.unsubscribe();
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

    private rebuildPageDisplayState(): void {
        const pageItems = this.getPageItems(this.latestPages)
            .filter(item => item.page.count > 0);

        this.ensureValidActiveAndPinnedPages(pageItems);

        this.pageDisplayOptions = pageItems.map(item => ({
            label: this.shouldShowTypeColumn(item.page)
                ? 'Results'
                : this.getPageTypeLabel(item.page),
            value: this.getPageDisplayKey(item.page, item.index)
        }));

        const displayKeys = [
            this.activePageDisplayKey,
            ...this.pinnedPageDisplayKeys
        ].filter(key => !!key);

        const uniqueDisplayKeys = Array.from(new Set(displayKeys));

        this.displayedPageItems = pageItems.filter(item =>
            uniqueDisplayKeys.includes(this.getPageDisplayKey(item.page, item.index))
        );
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

    selectActivePage(key: string | number): void {
        this.activePageDisplayKey = String(key);
        this.rebuildPageDisplayState();
    }

    isPagePinned(key: string): boolean {
        return this.pinnedPageDisplayKeys.includes(key);
    }

    togglePinnedPage(key: string): void {
        if (this.isPagePinned(key)) {
            this.pinnedPageDisplayKeys = this.pinnedPageDisplayKeys.filter(k => k !== key);
            this.rebuildPageDisplayState();
            return;
        }

        if (this.pinnedPageDisplayKeys.length >= this.maxPinnedPages) {
            return;
        }

        this.pinnedPageDisplayKeys = [...this.pinnedPageDisplayKeys, key];
        this.rebuildPageDisplayState();
    }

    trackByPageItem = (index: number, item: { page: LocationPage; index: number }): string | number => {
        return this.getPageDisplayKey(item.page, item.index);
    }

    public getPageDisplayKey(page: LocationPage, index: number): string {
        return page.type?.trim()
            ? page.type
            : `page-${index}`;
    }

    getPageItems(pages: LocationPage[]): PageDisplayItem[] {
        return pages.map((page, index) => ({
            page,
            index
        }));
    }

    ensureValidActiveAndPinnedPages(pageItems: PageDisplayItem[]): void {
        const validKeys = pageItems.map(item =>
            this.getPageDisplayKey(item.page, item.index)
        );

        if (!this.activePageDisplayKey || !validKeys.includes(this.activePageDisplayKey)) {
            this.activePageDisplayKey = validKeys[0] ?? '';
        }

        this.pinnedPageDisplayKeys = this.pinnedPageDisplayKeys.filter(key =>
            validKeys.includes(key)
        );
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
