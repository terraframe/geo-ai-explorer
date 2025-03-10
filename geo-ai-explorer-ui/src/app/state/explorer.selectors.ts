import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ExplorerStateModel } from "./explorer.reducer";

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

