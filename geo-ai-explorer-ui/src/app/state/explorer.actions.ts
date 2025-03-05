import { createActionGroup, props } from '@ngrx/store';
import { GeoObject } from '../models/geoobject.model';

export const ExplorerActions = createActionGroup({
    source: 'explorer',
    events: {
        'Add GeoObject': props<{ object: GeoObject }>(),
        'Set GeoObjects': props<{ objects: GeoObject[] }>(),

    },
});
