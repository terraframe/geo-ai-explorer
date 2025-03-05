import { v4 as uuidv4 } from 'uuid';
import { createReducer, on } from '@ngrx/store';
import { ExplorerActions } from './explorer.actions';
import { GeoObject } from '../models/geoobject.model';

export interface ExplorerStateModel {
    objects: GeoObject[];
}

export const initialState: ExplorerStateModel = {
    objects: [],
}

export const explorerReducer = createReducer(
    initialState,
    on(ExplorerActions.addGeoObject, (state, wrapper) => {
        const objects = [...state.objects];
        objects.push(wrapper.object);

        return { ...state, objects }
    }),

    on(ExplorerActions.setGeoObjects, (state, wrapper) => {

        return { ...state, objects: wrapper.objects }
    }),

);