import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { GeoObject } from '../models/geoobject.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { LetDirective } from '@ngrx/component';

import { selectObjects, selectedObject } from '../state/explorer.selectors';
import { ExplorerActions } from '../state/explorer.actions';

@Component({
    selector: 'results-table',
    imports: [TableModule, LetDirective],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss',
})
export class ResultsTableComponent implements OnInit, OnDestroy {
    private store = inject(Store);

    objects$: Observable<GeoObject[]> = this.store.select(selectObjects);

    selectedObject$: Observable<GeoObject | null> = this.store.select(selectedObject);

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }

    onClick(obj: GeoObject) {
        this.store.dispatch(ExplorerActions.selectGeoObject({ object: obj }));
    }
}
