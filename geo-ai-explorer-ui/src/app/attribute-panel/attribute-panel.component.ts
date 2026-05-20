import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Store } from '@ngrx/store';

import { GeoObject } from '../models/geoobject.model';
import { Observable, Subscription } from 'rxjs';
import { ExplorerService } from '../service/explorer.service';
import { getWorkflowState, WorkflowState, WorkflowStep } from '../state/explorer.state';
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

  workflowState$: Observable<WorkflowState> = this.store.select(getWorkflowState);

  onWorkflowStateChange: Subscription;

  geoObject: GeoObject | null = null;

  constructor(
    private explorerService: ExplorerService,
    private errorService: ErrorService
  ) {
    this.onWorkflowStateChange = this.workflowState$.subscribe(state => {
      const object = state.step === WorkflowStep.InspectObject
        ? state.data as GeoObject
        : null;

      this.selectObject(object);
    });
  }

  selectObject(object: GeoObject | null) {
    if (this.geoObject != null && object != null && this.geoObject.properties.uri === object.properties.uri) return;

    if (object != null) {
      this.explorerService.getAttributes(object.properties.uri)
        .then(geoObject => {
          this.geoObject = geoObject
        })
        .catch(error => this.errorService.handleError(error))
    }

    this.geoObject = object;
  }

  ngOnDestroy(): void {
    this.onWorkflowStateChange.unsubscribe();
  }


}
