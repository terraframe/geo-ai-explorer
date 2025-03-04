import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { GeoObject } from '../explorer/explorer.component';

@Component({
    selector: 'results-table',
    imports: [TableModule],
    templateUrl: './results-table.component.html',
    styleUrl: './results-table.component.scss'
})
export class ResultsTableComponent {
    @Input() public objects: GeoObject[] = [];
}
