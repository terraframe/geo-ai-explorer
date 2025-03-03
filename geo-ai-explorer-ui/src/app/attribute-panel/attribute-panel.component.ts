import { Component, Input } from '@angular/core';
import { ExplorerComponent, GeoObject } from '../explorer/explorer.component';

@Component({
    selector: 'attribute-panel',
    imports: [],
    templateUrl: './attribute-panel.component.html',
    styleUrl: './attribute-panel.component.scss'
})
export class AttributePanelComponent {
  @Input() public selectedObject!: GeoObject;

  public getObjectUrl(go: GeoObject): string {
    return ExplorerComponent.getObjectUrl(go);
  }

  public getUsaceUri(go: GeoObject): string {
    return ExplorerComponent.getUsaceUri(go);
  }
}
