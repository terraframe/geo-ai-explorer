import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LetDirective } from '@ngrx/component';

import { highlightedObject, selectObjects, selectedObject } from '../state/explorer.selectors';
import { ExplorerActions } from '../state/explorer.actions';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'results-table',
    imports: [TableModule, LetDirective, CommonModule],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss',
})
export class ResultsTableComponent implements OnInit, OnDestroy {
    private store = inject(Store);

    objects$: Observable<GeoObject[]> = this.store.select(selectObjects);

    selectedObject$: Observable<{ object: GeoObject, zoomMap: boolean } | null> = this.store.select(selectedObject);

    highlightedObject$: Observable<{ object: GeoObject } | null> = this.store.select(highlightedObject);
    
    onHighlightedObjectChange: Subscription;

    public highlightedObjectUri: string | null | undefined;

    constructor() {
        this.onHighlightedObjectChange = this.highlightedObject$.subscribe(selection => {
            this.highlightObject(selection == null ? undefined : selection.object.properties.uri);
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }

    onClick(obj: GeoObject) {
        this.store.dispatch(ExplorerActions.selectGeoObject({ object: obj, zoomMap: true }));
    }

    onRowHover(obj: GeoObject) {
        this.store.dispatch(ExplorerActions.highlightGeoObject({ object: obj }));
    }

    onMouseLeaveTable() {
        this.highlightedObjectUri = null;
    }

    highlightObject(uri?: string) {
        this.highlightedObjectUri = uri;
    }
}
