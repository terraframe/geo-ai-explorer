import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Store } from '@ngrx/store';

import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription } from 'rxjs';
import { ExplorerService } from '../service/explorer.service';
import { selectedObject } from '../state/explorer.state';
import { ErrorService } from '../service/error-service.service';


@Component({
  selector: 'attribute-panel',
  imports: [
    CommonModule, TableModule
  ],
  templateUrl: './attribute-panel.component.html',
  styleUrl: './attribute-panel.component.scss'
})
export class AttributePanelComponent implements OnDestroy {


  private store = inject(Store);

  selectedObject$: Observable<GeoObject | null> = this.store.select(selectedObject);

  onSelectedObjectChange: Subscription;

  geoObject: GeoObject | null = null;

  constructor(
    private explorerService: ExplorerService,
    private errorService: ErrorService
  ) {
    this.onSelectedObjectChange = this.selectedObject$.subscribe(object => {
      this.selectObject(object);
    });
  }

  selectObject(object: GeoObject | null) {
    if (this.geoObject != null && object != null && this.geoObject.properties.uri === object.properties.uri) return;

    if (object != null) {
      this.explorerService.getAttributes(object.properties.uri)
        .then(geoObject => this.geoObject = geoObject)
        .catch(error => this.errorService.handleError(error))
    }

    this.geoObject = object;
  }

  ngOnDestroy(): void {
    this.onSelectedObjectChange.unsubscribe();
  }


}
