import { createActionGroup, props } from '@ngrx/store';
import { GeoObject } from '../models/geoobject.model';
import { Style, StyleConfig } from '../models/style.model';

export const ExplorerActions = createActionGroup({
    source: 'explorer',
    events: {
        'Add GeoObject': props<{ object: GeoObject }>(),
        'Set GeoObjects': props<{ objects: GeoObject[] }>(),
        'Select GeoObject': props<{ object: GeoObject }>(),
        'Add Style': props<{ typeUri: string, style: Style }>(),
        'Set Styles': props<{ styles: StyleConfig }>(),

    },
});
