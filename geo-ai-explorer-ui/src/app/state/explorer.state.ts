import { createActionGroup, props, createReducer, on, createFeatureSelector, createSelector } from "@ngrx/store";

import { GeoObject } from '../models/geoobject.model';
import { Style, StyleConfig } from '../models/style.model';

export const ExplorerActions = createActionGroup({
    source: 'explorer',
    events: {
        'Add GeoObject': props<{ object: GeoObject }>(),
        'Set GeoObjects': props<{ objects: GeoObject[] }>(),
        'Select GeoObject': props<{ object: GeoObject, zoomMap: boolean } | null>(),
        'Highlight GeoObject': props<{ object: GeoObject } | null>(),
        'Add Style': props<{ typeUri: string, style: Style }>(),
        'Set Styles': props<{ styles: StyleConfig }>(),

    },
});

export interface ExplorerStateModel {
    objects: GeoObject[];
    styles: StyleConfig;
    selectedObject: GeoObject | null;
    highlightedObject: GeoObject | null;
    zoomMap: boolean;
}

export const initialState: ExplorerStateModel = {
    objects: [],
    styles: {},
    selectedObject: null,
    zoomMap: false,
    highlightedObject: null,
}

export const explorerReducer = createReducer(
    initialState,

    // Add geo object
    on(ExplorerActions.addGeoObject, (state, wrapper) => {
        const objects = [...state.objects];
        objects.push(wrapper.object);

        return { ...state, objects }
    }),
    // Set all geo objects
    on(ExplorerActions.setGeoObjects, (state, wrapper) => {

        return { ...state, objects: wrapper.objects }
    }),

    // Select geo object
    on(ExplorerActions.selectGeoObject, (state, { object, zoomMap }) => ({
        ...state,
        selectedObject: object,
        zoomMap: zoomMap
    })),

    // Highlight geo object
    on(ExplorerActions.highlightGeoObject, (state, { object }) => ({
        ...state,
        highlightedObject: object
    })),

    // Add style
    on(ExplorerActions.addStyle, (state, wrapper) => {
        const styles = { ...state.styles };
        styles[wrapper.typeUri] = wrapper.style;

        return { ...state, styles }
    }),
    // Set style config
    on(ExplorerActions.setStyles, (state, wrapper) => {

        return { ...state, styles: wrapper.styles }
    }),

);


const selector = createFeatureSelector<ExplorerStateModel>('explorer');

export const selectObjects = createSelector(selector, (s) => {
    return s.objects;
});

export const selectStyles = createSelector(selector, (s) => {
    return s.styles;
});

export const selectedObject = createSelector(selector, (s) => {
    return s.selectedObject ? { object: s.selectedObject, zoomMap: s.zoomMap } : null;
});

export const highlightedObject = createSelector(selector, (s) => {
    return s.highlightedObject ? { object: s.highlightedObject } : null;
});


