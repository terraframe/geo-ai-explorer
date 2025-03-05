import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { GeoObject } from '../models/geoobject.model';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { LetDirective } from '@ngrx/component';

import { selectObjects } from '../state/explorer.selectors';

@Component({
    selector: 'results-table',
    imports: [TableModule, LetDirective],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss',
})
export class ResultsTableComponent implements OnInit, OnDestroy {
    private store = inject(Store);

    objects$: Observable<GeoObject[]> = this.store.select(selectObjects);

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }
}
