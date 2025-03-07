import { v4 as uuidv4 } from 'uuid';
import { createReducer, on } from '@ngrx/store';
import { ExplorerActions } from './explorer.actions';
import { GeoObject } from '../models/geoobject.model';
import { StyleConfig } from '../models/style.model';

export interface ExplorerStateModel {
    objects: GeoObject[];
    styles: StyleConfig;
    selectedObject: GeoObject | null;
}

export const initialState: ExplorerStateModel = {
    objects: [],
    styles: {},
    selectedObject: null
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
    on(ExplorerActions.selectGeoObject, (state, wrapper) => {
        return { ...state, selectedObject: wrapper.object || null };
    }),

    // Add style
    on(ExplorerActions.addStyle, (state, wrapper) => {
        const styles = {...state.styles};
        styles[wrapper.typeUri] = wrapper.style;

        return { ...state, styles }
    }),
    // Set style config
    on(ExplorerActions.setStyles, (state, wrapper) => {

        return { ...state, styles: wrapper.styles }
    }),

);