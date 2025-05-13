import { createActionGroup, props, createReducer, on, createFeatureSelector, createSelector } from "@ngrx/store";
// @ts-ignore
import ColorGen from "color-generator";

import { GeoObject } from '../models/geoobject.model';
import { Style, StyleConfig } from '../models/style.model';
import { VectorLayer } from "../models/vector-layer.model";
import { Configuration } from "../models/configuration.model";
import { LocationPage } from "../models/chat.model";
import { defaultStyles } from "../explorer/defaultQueries";

export const ExplorerActions = createActionGroup({
    source: 'explorer',
    events: {
        'Add GeoObject': props<{ object: GeoObject }>(),
        'Set Page': props<{
            page: LocationPage,
            zoomMap: boolean
        }>(),
        'Add Neighbor': props<{ object: GeoObject }>(),
        'Set Neighbors': props<{ objects: GeoObject[], zoomMap: boolean }>(),
        'Select GeoObject': props<{ object: GeoObject, zoomMap: boolean } | null>(),
        'Highlight GeoObject': props<{ object: GeoObject } | null>(),
        'Add Style': props<{ typeUri: string, style: Style }>(),
        'Set Styles': props<{ styles: StyleConfig }>(),
        'Set Vector Layer': props<{ layer: VectorLayer }>(),
        'Set Configuration': props<Configuration>(),
        'Set Workflow Step': props<{ step: WorkflowStep, data?: any }>()
    },
});

export enum WorkflowStep {
    AiChatAndResults = 'AiChatAndResults',
    DisambiguateObject = 'DisambiguateObject',
    ViewNeighbors = 'ViewNeighbors',
    InspectObject = 'InspectObject',
    MinimizeChat = 'MinimizeChat'
}

export interface ExplorerStateModel {
    neighbors: GeoObject[];
    styles: StyleConfig;
    selectedObject: GeoObject | null;
    highlightedObject: GeoObject | null;
    zoomMap: boolean;
    vectorLayers: VectorLayer[];
    page: LocationPage;
    workflowStep: WorkflowStep;
    workflowData?: any;
}

export const initialState: ExplorerStateModel = {
    neighbors: [],
    styles: {},
    selectedObject: null,
    zoomMap: false,
    highlightedObject: null,
    vectorLayers: [],
    workflowStep: WorkflowStep.AiChatAndResults,
    page: { 
        locations: [],
        statement: "",
        limit: 100,
        offset: 0,
        count: 0
    }
}

// Helper function for resolving missing styles based on the provided object types
const resolveMissingStyles = (styles: StyleConfig, objects: GeoObject[]) => {

    // Get a list of all the types which do not have styles
    const types: string[] = objects.map(o => o.properties.type).filter(t => t != null).reduce((acc: string[], t: string) => {
        if (!acc.some(item => t === item)) {
            acc.push(t);
        }
        return acc;
    }, []).filter(type => styles[type] == null);


    if (types.length > 0) {
        const newStyles = { ...styles };

        types.forEach(type => {
            if (newStyles[type] == null) {
                const defaultStyle = defaultStyles[type];
                newStyles[type] = {
                    order: defaultStyle?.order ?? 10,
                    color: ColorGen().hexString()
                };
            }
        })

        return newStyles
    }

    return null;
}

export const explorerReducer = createReducer(
    initialState,

    // Set all neighbors
    on(ExplorerActions.setNeighbors, (state, { objects, zoomMap }) => {

        const styles = resolveMissingStyles(state.styles, objects);

        return {
            ...state,
            styles: styles != null ? styles : state.styles,
            neighbors: objects,
            zoomMap: zoomMap,
        };
    }),

    // Set all geo objects
    on(ExplorerActions.setPage, (state, { page, zoomMap }) => {

        const styles = resolveMissingStyles(state.styles, page.locations);

        return {
            ...state,
            styles: styles != null ? styles : state.styles,
            page,
            zoomMap
        };
    }),

    // Select geo object
    on(ExplorerActions.selectGeoObject, (state, { object, zoomMap }) => {

        let styles = state.styles

        if (object != null)
            styles = resolveMissingStyles(state.styles, [ object ]) as StyleConfig;

        return {
            ...state,
            styles: styles != null ? styles : state.styles,
            selectedObject: object,
            zoomMap
        };
    }),

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
        page: {
            ...state.page,
            locations: [...state.page.locations, object]
        }
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

    // Set Workflow Step
    on(ExplorerActions.setWorkflowStep, (state, { step, data }) => ({
        ...state,
        workflowStep: step,
        workflowData: data
    })),
    
);


const selector = createFeatureSelector<ExplorerStateModel>('explorer');

export const getObjects = createSelector(selector, (s) => {
    return s.page.locations;
});

export const getPage = createSelector(selector, (s) => {
    return s.page;
});

export const getNeighbors = createSelector(selector, (s) => {
    return s.neighbors;
});

export const getZoomMap = createSelector(selector, (s) => {
    return s.zoomMap;
});

export const getStyles = createSelector(selector, (s) => {
    return s.styles;
});

export const selectedObject = createSelector(selector, (s) => {
    return s.selectedObject;
});

export const highlightedObject = createSelector(selector, (s) => {
    return s.highlightedObject;
});

export const getVectorLayers = createSelector(selector, (s) => {
    return s.vectorLayers
});

export const getWorkflowStep = createSelector(selector, (s) => s.workflowStep);

export const getWorkflowData = createSelector(selector, (s) => s.workflowData);
