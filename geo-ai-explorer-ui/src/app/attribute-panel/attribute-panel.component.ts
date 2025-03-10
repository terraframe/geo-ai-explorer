import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Store } from '@ngrx/store';

import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription } from 'rxjs';
import { selectedObject } from '../state/explorer.selectors';
import { ExplorerService } from '../service/explorer.service';


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

  selectedObject$: Observable<{ object: GeoObject, zoomMap: boolean } | null> = this.store.select(selectedObject);

  onSelectedObjectChange: Subscription;

  geoObject: GeoObject | null = null;

  constructor(private explorerService: ExplorerService) {
    this.onSelectedObjectChange = this.selectedObject$.subscribe(selection => {
      if (selection) {
        this.explorerService.getAttributes(selection.object.properties.uri).then(geoObject => this.geoObject = geoObject);
      } else {
        this.geoObject = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.onSelectedObjectChange.unsubscribe();
  }


}
