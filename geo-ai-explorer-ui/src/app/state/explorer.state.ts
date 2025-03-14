import { createActionGroup, props, createReducer, on, createFeatureSelector, createSelector } from "@ngrx/store";

import { GeoObject } from '../models/geoobject.model';
import { Style, StyleConfig } from '../models/style.model';
import { VectorLayer } from "../models/vector-layer.model";
import { Configuration } from "../models/configuration.model";

export const ExplorerActions = createActionGroup({
    source: 'explorer',
    events: {
        'Add GeoObject': props<{ object: GeoObject }>(),
        'Set GeoObjects': props<{ objects: GeoObject[], zoomMap: boolean }>(),
        'Add Neighbor': props<{ object: GeoObject }>(),
        'Set Neighbors': props<{ objects: GeoObject[], zoomMap: boolean }>(),
        'Select GeoObject': props<{ object: GeoObject, zoomMap: boolean } | null>(),
        'Highlight GeoObject': props<{ object: GeoObject } | null>(),
        'Add Style': props<{ typeUri: string, style: Style }>(),
        'Set Styles': props<{ styles: StyleConfig }>(),
        'Set Vector Layer': props<{ layer: VectorLayer }>(),
        'Set Configuration': props<Configuration>(),
    },
});

export interface ExplorerStateModel {
    objects: GeoObject[];
    neighbors: GeoObject[];
    styles: StyleConfig;
    selectedObject: GeoObject | null;
    highlightedObject: GeoObject | null;
    zoomMap: boolean;
    vectorLayers: VectorLayer[];
}

export const initialState: ExplorerStateModel = {
    objects: [],
    neighbors: [],
    styles: {},
    selectedObject: null,
    zoomMap: false,
    highlightedObject: null,
    vectorLayers: []
}

export const explorerReducer = createReducer(
    initialState,

    // Set all neighbors
    on(ExplorerActions.setNeighbors, (state, { objects, zoomMap }) => ({
        ...state,
        neighbors: objects,
        zoomMap: zoomMap,
    })),

    // Set all geo objects
    on(ExplorerActions.setGeoObjects, (state, { objects, zoomMap }) => ({
        ...state,
        objects: objects,
        zoomMap: zoomMap,
    })),

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

    // Add Neighbor
    on(ExplorerActions.addNeighbor, (state, { object }) => ({
        ...state,
        neighbors: [...state.neighbors, object]
    })),

    // Add geo object
    on(ExplorerActions.addGeoObject, (state, { object }) => ({
        ...state,
        objects: [...state.objects, object]
    })),

    // Add style
    on(ExplorerActions.addStyle, (state, { typeUri, style }) => ({
        ...state,
        styles: { ...state.styles, [typeUri]: style }
    })),

    // Set the vector layers & styles
    on(ExplorerActions.setConfiguration, (state, configuration) => {

        return { ...state, vectorLayers: configuration.layers, styles: configuration.styles }
    }),

    // Set the vector layer
    on(ExplorerActions.setVectorLayer, (state, { layer }) => {

        const vectorLayers = [...state.vectorLayers];
        const index = vectorLayers.findIndex(v => v.id === layer.id)

        if (index !== -1) {
            vectorLayers[index] = layer
        }
        else {
            vectorLayers.push(layer)
        }

        return { ...state, vectorLayers }
    }),

    // Set styles
    on(ExplorerActions.setStyles, (state, { styles }) => ({
        ...state,
        styles: styles
    })),
);


const selector = createFeatureSelector<ExplorerStateModel>('explorer');

export const selectObjects = createSelector(selector, (s) => ({
    objects: s.objects,
    zoomMap: s.zoomMap,
}));

export const selectNeighbors = createSelector(selector, (s) => ({
    neighbors: s.neighbors,
    zoomMap: s.zoomMap,
}));

export const selectStyles = createSelector(selector, (s) => {
    return s.styles;
});

export const selectedObject = createSelector(selector, (s) => {
    return s.selectedObject ? { object: s.selectedObject, zoomMap: s.zoomMap } : null;
});

export const highlightedObject = createSelector(selector, (s) => {
    return s.highlightedObject ? { object: s.highlightedObject } : null;
});

export const getVectorLayers = createSelector(selector, (s) => {
    return s.vectorLayers
});


