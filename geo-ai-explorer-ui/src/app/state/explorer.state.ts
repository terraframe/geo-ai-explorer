import { createActionGroup, props, emptyProps, createReducer, on, createFeatureSelector, createSelector } from "@ngrx/store";
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
        'Set Pages': props<{ pages: LocationPage[], zoomMap: boolean }>(),
        'Add Neighbor': props<{ object: GeoObject }>(),
        'Set Neighbors': props<{ objects: GeoObject[], zoomMap: boolean }>(),
        'Select GeoObject': props<{ object: GeoObject, zoomMap: boolean } | null>(),
        'Highlight GeoObject': props<{ object: GeoObject } | null>(),
        'Add Style': props<{ typeUri: string, style: Style }>(),
        'Set Styles': props<{ styles: StyleConfig }>(),
        'Set Vector Layer': props<{ layer: VectorLayer }>(),
        'Set Configuration': props<Configuration>(),
        'Set Workflow Step': props<{ step: WorkflowStep, data?: any }>(),
        'Append Workflow Step': props<{ step: WorkflowStep, data?: any }>(),
        'Back Workflow Step': emptyProps(),
        'Clear Workflow History': emptyProps(),
        'Show Pages On Map': props<{ pages: LocationPage[]; zoomMap: boolean; step: WorkflowStep.MapAndResults | WorkflowStep.DisambiguateObject; data?: any; }>(),
    },
});

export interface WorkflowState {
    step: WorkflowStep;
    data?: any;
}

export enum WorkflowStep {
    FullScreenChat = "FullScreenChat",
    AiChatAndResults = "AiChatAndResults",
    MapAndResults = 'MapAndResults',
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
    pages: LocationPage[];
    workflowStep: WorkflowStep;
    workflowData?: any;
    workflowHistory: WorkflowState[];
}

export const initialState: ExplorerStateModel = {
    neighbors: [],
    styles: {},
    selectedObject: null,
    zoomMap: false,
    highlightedObject: null,
    vectorLayers: [],
    workflowStep: WorkflowStep.FullScreenChat,
    workflowHistory: [],
    pages: [{ 
        locations: [],
        statement: "",
        type: "",
        limit: 100,
        offset: 0,
        count: 0
    }]
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

const resolveMissingStylesPages = (styles: StyleConfig, pages: LocationPage[]): StyleConfig | null => {
  let resolvedStyles = styles;
  let changed = false;

  pages.forEach(page => {
    const nextStyles = resolveMissingStyles(resolvedStyles, page.locations);

    if (nextStyles != null) {
      resolvedStyles = nextStyles;
      changed = true;
    }
  });

  return changed ? resolvedStyles : null;
};

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
    on(ExplorerActions.setPages, (state, { pages, zoomMap }) => {

        const styles = resolveMissingStylesPages(state.styles, pages);

        return {
            ...state,
            styles: styles != null ? styles : state.styles,
            pages,
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
    // on(ExplorerActions.addGeoObject, (state, { object }) => ({
    //     ...state,
    //     pages: {
    //         ...state.page,
    //         locations: [...state.page.locations, object]
    //     }
    // })),

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

    // Forcibly sets the workflow step, clearing all history
    on(ExplorerActions.setWorkflowStep, (state, { step, data }) => ({
        ...state,
        workflowStep: step,
        workflowData: data,
        workflowHistory: []
    })),

    // Append Workflow Step
    on(ExplorerActions.appendWorkflowStep, (state, { step, data }) => {
        const current: WorkflowState = {
            step: state.workflowStep,
            data: state.workflowData
        };

        return {
            ...state,
            workflowStep: step,
            workflowData: data,
            workflowHistory: [...state.workflowHistory, current]
        };
    }),

    // Back Workflow Step
    on(ExplorerActions.backWorkflowStep, (state) => {
        if (state.workflowHistory.length === 0) {
            return {
                ...state,
                workflowStep: WorkflowStep.FullScreenChat,
                workflowData: undefined
            };
        }

        const workflowHistory = [...state.workflowHistory];
        const previous = workflowHistory.pop()!;

        return {
            ...state,
            workflowStep: previous.step,
            workflowData: previous.data,
            workflowHistory
        };
    }),

    // Clear Workflow History
    on(ExplorerActions.clearWorkflowHistory, (state) => ({
        ...state,
        workflowHistory: []
    })),

    on(ExplorerActions.showPagesOnMap, (state, { pages, zoomMap, step, data }) => {
        const styles = resolveMissingStylesPages(state.styles, pages);

        return {
            ...state,
            styles: styles != null ? styles : state.styles,
            pages,
            zoomMap,
            workflowStep: step,
            workflowData: data,
            workflowHistory: []
        };
    }),
    
);


const selector = createFeatureSelector<ExplorerStateModel>('explorer');

export const getPages = createSelector(selector, (s) => {
    return s.pages;
});

export const getObjects = createSelector(getPages, (pages): GeoObject[] => {
  return pages.flatMap(page => page.locations ?? []);
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

export const getWorkflowState = createSelector(
  getWorkflowStep,
  getWorkflowData,
  (step, data): WorkflowState => ({
    step,
    data
  })
);

export const getWorkflowHistory = createSelector(selector, (s) => s.workflowHistory);

export const getPreviousWorkflowState = createSelector(selector, (s): WorkflowState | undefined => {
    return s.workflowHistory.length > 0
        ? s.workflowHistory[s.workflowHistory.length - 1]
        : undefined;
});

export const getPreviousWorkflowStep = createSelector(selector, (s): WorkflowStep | undefined => {
    return s.workflowHistory.length > 0
        ? s.workflowHistory[s.workflowHistory.length - 1].step
        : undefined;
});

export const getPreviousWorkflowData = createSelector(selector, (s): any | undefined => {
    return s.workflowHistory.length > 0
        ? s.workflowHistory[s.workflowHistory.length - 1].data
        : undefined;
});
