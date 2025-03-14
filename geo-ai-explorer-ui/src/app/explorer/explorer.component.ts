import { Component, AfterViewInit, TemplateRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, AttributionControl, LngLatBounds, LngLat, GeoJSONSource, LngLatBoundsLike, MapGeoJSONFeature } from "maplibre-gl";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import JSON5 from 'json5'
// @ts-ignore
import ColorGen from "color-generator";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { Observable, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { GeoObject } from '../models/geoobject.model';
import { StyleConfig } from '../models/style.model';

import { AttributePanelComponent } from '../attribute-panel/attribute-panel.component';
import { AichatComponent } from '../aichat/aichat.component';
import { ResultsTableComponent } from '../results-table/results-table.component';
import { StyleService } from '../service/configuration-service.service';
import { GraphExplorerComponent } from '../graph-explorer/graph-explorer.component';
import { defaultQueries, SELECTED_COLOR } from './defaultQueries';
import { AllGeoJSON, bbox, bboxPolygon, union } from '@turf/turf';
import { ExplorerService } from '../service/explorer.service';
import { ErrorService } from '../service/error-service.service';
import { ExplorerActions, getVectorLayers, highlightedObject, selectedObject, selectNeighbors, selectObjects, selectStyles } from '../state/explorer.state';
import { TabsModule } from 'primeng/tabs';
import { debounce } from 'lodash';
import { VectorLayer } from '../models/vector-layer.model';


@Component({
    selector: 'app-explorer',
    imports: [
        CommonModule,
        FormsModule,
        GraphExplorerComponent,
        AichatComponent,
        AttributePanelComponent,
        DragDropModule,
        ResultsTableComponent,
        ProgressSpinnerModule,
        PanelModule,
        ToastModule,
        TabsModule,
        CheckboxModule
    ],
    templateUrl: './explorer.component.html',
    styleUrl: './explorer.component.scss'
})
export class ExplorerComponent implements OnInit, OnDestroy, AfterViewInit {

    public static GEO = "http://www.opengis.net/ont/geosparql#";

    public static GEO_FEATURE = ExplorerComponent.GEO + "Feature";

    public static GEO_WKT_LITERAL = ExplorerComponent.GEO + "wktLiteral";

    private store = inject(Store);

    geoObjects$: Observable<{ objects: GeoObject[], zoomMap: boolean }> = this.store.select(selectObjects);

    geoObjects: GeoObject[] = [];

    renderedObjects: string[] = [];

    onGeoObjectsChange: Subscription;

    neighbors$: Observable<{ neighbors: GeoObject[], zoomMap: boolean }> = this.store.select(selectNeighbors);

    neighbors: GeoObject[] = [];

    onNeighborsChange: Subscription;

    styles$: Observable<StyleConfig> = this.store.select(selectStyles);

    onStylesChange: Subscription;

    selectedObject$: Observable<{ object: GeoObject, zoomMap: boolean } | null> = this.store.select(selectedObject);

    onSelectedObjectChange: Subscription;

    highlightedObject$: Observable<{ object: GeoObject } | null> = this.store.select(highlightedObject);

    onHighlightedObjectChange: Subscription;

    resolvedStyles: StyleConfig = {};

    public inspectorTab = 0;

    map?: Map;

    // file?: string;

    importError?: string;

    public defaultQueries = defaultQueries;

    public loading: boolean = false;

    public typeLegend: { [key: string]: { label: string, color: string } } = {};

    public selectedObject?: GeoObject;

    public highlightedObject: GeoObject | null | undefined;

    baseLayers: any[] = [
        {
            name: "Satellite",
            label: "Satellite",
            id: "satellite-v9",
            sprite: "mapbox://sprites/mapbox/satellite-v9",
            url: "mapbox://mapbox.satellite",
            selected: true
        }
    ];

    orderedTypes: string[] = [];

    initialized: boolean = false;

    vectorLayers$: Observable<VectorLayer[]> = this.store.select(getVectorLayers);

    onVectorLayersChange: Subscription;

    private zoomMap: boolean = false;

    public activeTab: string = '0';

    constructor(
        private styleService: StyleService,
        private explorerService: ExplorerService,
        private errorService: ErrorService
    ) {
        this.onGeoObjectsChange = this.geoObjects$.subscribe(event => {
            this.geoObjects = event.objects;
            this.zoomMap = event.zoomMap;

            this.resolveStyles();
        })

        this.onNeighborsChange = this.neighbors$.subscribe(event => {
            this.neighbors = event.neighbors;
            this.zoomMap = event.zoomMap;

            this.resolveStyles();
        });

        this.onStylesChange = this.styles$.subscribe(styles => {
            this.resolvedStyles = styles;

            this.render();
        });

        this.onVectorLayersChange = this.vectorLayers$.subscribe(() => {
            this.render();
        });

        this.onSelectedObjectChange = this.selectedObject$.subscribe(event => {
            if (event) {
                this.selectObject(event.object.properties.uri, event.zoomMap);

                if (event.zoomMap)
                    this.zoomTo(event.object.properties.uri);
            } else {
                this.selectObject(undefined, false);
            }

            // Selecting or unselecting an object can change the map size. If we don't resize, we can end up with weird white bars on the side when the attribute panel goes away.
            setTimeout(() => {
                this.map?.resize();
            }, 0);
        });

        this.onHighlightedObjectChange = this.highlightedObject$.subscribe(selection => {
            this.highlightObject(selection == null ? undefined : selection.object.properties.uri);
        });
    }

    ngOnInit(): void {
        this.styleService.get().then(configuration => {
            this.store.dispatch(ExplorerActions.setConfiguration(configuration));
        }).catch(error => this.errorService.handleError(error));
    }

    ngOnDestroy(): void {
        this.onGeoObjectsChange.unsubscribe();
        this.onNeighborsChange.unsubscribe();
        this.onStylesChange.unsubscribe();
        this.onVectorLayersChange.unsubscribe();
        this.onSelectedObjectChange.unsubscribe();
        this.onHighlightedObjectChange.unsubscribe();
    }

    onTabChange(event: any) {
        this.activeTab = event;
    }

    ngAfterViewInit() {
        this.initializeMap();
    }

    resolveStyles(): void {
        const types = Object.keys(this.geoObjectsByType());

        // Resolve the style of all of the types
        this.styles$.pipe(take(1)).subscribe(styles => {
            const missingStyles = types.filter(type => styles[type] == null);

            if (missingStyles.length > 0) {
                const newStyles = { ...styles };

                types.forEach(type => {
                    if (newStyles[type] == null) {
                        newStyles[type] = {
                            order: 0,
                            color: ColorGen().hexString()
                        }
                    }
                })

                this.store.dispatch(ExplorerActions.setStyles({ styles: newStyles }));
            }
            else {
                this.render();
            }
        })
    }

    render(): void {
        if (this.initialized && this.isDirty()) {
            // Clear the map
            this.clearAllMapData();

            // Handle the vector layers
            this.mapVectorLayers();

            // Handle the geo objects
            const types = Object.keys(this.geoObjectsByType());

            // Order the types by the order defined in their style config
            this.orderedTypes = types.sort((a, b) => {
                return (this.resolvedStyles[a]?.order ?? 999) - (this.resolvedStyles[b]?.order ?? 999);
            });

            this.calculateTypeLegend();

            this.mapGeoObjects();

            if (this.zoomMap) {
                this.zoomToAll();
            }

            this.renderHighlights();

            this.renderedObjects = this.allGeoObjects().map(obj => obj.properties.uri);
        }
    }

    calculateTypeLegend() {
        this.typeLegend = {};

        this.orderedTypes.forEach(type => {
            this.typeLegend[type] = {
                label: this.labelForType(type),
                color: this.resolvedStyles[type].color
            }
        });
    }

    labelForType(typeUri: string): string {
        if (this.resolvedStyles[typeUri].label) {
            return this.resolvedStyles[typeUri].label as string;
        } else {
            return ExplorerComponent.uriToLabel(typeUri);
        }
    }

    public static uriToLabel(uri: string): string {
        let i = uri.lastIndexOf("#");
        if (i == -1) return uri;

        return uri.substring(i + 1);
    }

    getTypeLegend() { return this.typeLegend; }

    clearAllMapData() {
        if (!this.map) return;

        this.map!.getStyle().layers.forEach(layer => {
            if (this.map!.getLayer(layer.id) && this.baseLayers[0].id !== layer.id) {
                this.map!.removeLayer(layer.id);
            }
        });

        Object.keys(this.map!.getStyle().sources).forEach(source => {
            if (this.map!.getSource(source) && source !== 'mapbox') {
                this.map!.removeSource(source);
            }
        });
    }

    mapVectorLayers() {
        this.vectorLayers$.pipe(take(1)).subscribe(layers => {
            layers.filter(l => l.enabled).forEach(layer => {

                this.map!.addSource(layer.id, {
                    type: "vector",
                    tiles: [
                        layer.url
                    ],
                    promoteId: layer.codeProperty
                });

                // Add the hierarchy polygon layer
                this.map!.addLayer({
                    "id": layer.id + "-polygon",
                    "source": layer.id,
                    "type": "fill",
                    "paint": {
                        'fill-color': [
                            "case",
                            ["boolean", ["feature-state", "selected"], false],
                            SELECTED_COLOR,
                            layer.color
                        ],
                        "fill-opacity": 0.8,
                        "fill-outline-color": "black"
                    },
                    "source-layer": layer.sourceLayer,
                });

                // Add the hierarchy label layer
                this.map!.addLayer({
                    "id": layer.id + "-label",
                    "source": layer.id,
                    "type": "symbol",
                    "paint": {
                        "text-color": "black",
                        "text-halo-color": "#fff",
                        "text-halo-width": 2
                    },
                    "layout": {
                        "text-field": ["get", layer.labelProperty],
                        "text-font": ["NotoSansRegular"],
                        "text-offset": [0, 0.6],
                        "text-anchor": "top",
                        "text-size": 12,
                    },
                    "source-layer": layer.sourceLayer
                });
            });
        });

    }

    mapGeoObjects() {
        // setTimeout(() => {
        // Find the index of the first symbol layer in the map style
        const layers = this.map?.getStyle().layers;
        let firstSymbolId;
        for (let i = 0; i < layers!.length; i++) {
            if (layers![i].type === 'symbol') {
                firstSymbolId = layers![i].id;
                break;
            }
        }

        // The layers are organized by the type, so we have to group geoObjects by type and create a layer for each type
        let gosByType = this.geoObjectsByType();

        let allGeoObjects = this.allGeoObjects();
        for (let i = this.orderedTypes.length - 1; i >= 0; --i) {
            let type = this.orderedTypes[i];
            let geoObjects = gosByType[type];

            if (geoObjects.length == 0) continue;
            if (geoObjects[0].geometry == null) continue; // TODO : Find this out at the type level...

            let geojson: any = {
                type: "FeatureCollection",
                features: []
            }

            for (let i = 0; i < allGeoObjects.length; ++i) {
                if (allGeoObjects[i].properties.type !== type) continue;

                let geoObject = allGeoObjects[i];

                geojson.features.push(geoObject);
            }

            this.map?.addSource(type, {
                type: "geojson",
                data: geojson,
                promoteId: 'uri' // A little surprised at mapbox here, but without this param it won't use the id property for the feature id
            });

            this.map?.addLayer(this.layerConfig(type, geoObjects[0].geometry.type.toUpperCase()),
                firstSymbolId);

            // Label layer
            this.map?.addLayer({
                id: type + "-LABEL",
                source: type,
                type: "symbol",
                paint: {
                    "text-color": "black",
                    "text-halo-color": "#fff",
                    "text-halo-width": 2
                },
                layout: {
                    "text-field": ["get", "label"],
                    "text-font": ["NotoSansRegular"],
                    "text-offset": [0, 0.6],
                    "text-anchor": "top",
                    "text-size": 12
                }
            });
        }
        // },10);
    }

    private layerConfig(type: string, geometryType: string): any {
        let layerConfig: any = {
            id: type,
            source: type
        };

        if (geometryType === "MULTIPOLYGON" || geometryType === "POLYGON") {
            layerConfig.paint = {
                'fill-color': [
                    "case",
                    ["boolean", ["feature-state", "selected"], false],
                    SELECTED_COLOR,
                    this.typeLegend[type].color
                ],
                'fill-opacity': 0.8
            };
            layerConfig.type = "fill";
        } else if (geometryType === "POINT" || geometryType === "MULTIPOINT") {
            layerConfig.paint = {
                "circle-radius": 10,
                "circle-color": [
                    "case",
                    ["boolean", ["feature-state", "selected"], false],
                    SELECTED_COLOR,
                    this.typeLegend[type].color
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#FFFFFF"
            };
            layerConfig.type = "circle";
        } else if (geometryType === "LINE" || geometryType === "MULTILINE" || geometryType === "MULTILINESTRING") {
            layerConfig.layout = {
                "line-join": "round",
                "line-cap": "round"
            }
            layerConfig.paint = {
                "line-color": [
                    "case",
                    ["boolean", ["feature-state", "selected"], false],
                    SELECTED_COLOR,
                    this.typeLegend[type].color
                ],
                "line-width": 3
            }
            layerConfig.type = "line";
        } else {
            // eslint-disable-next-line no-console
            console.log("Unexpected geometry type [" + geometryType + "]");
        }

        return layerConfig;
    }

    allGeoObjects(): GeoObject[] {
        let all = this.geoObjects.concat(this.neighbors);

        if (this.selectedObject)
            all.push(this.selectedObject);

        // Enforce each GeoObject only occurs once
        const seen = new Set<string>();
        return all.filter(obj => seen.has(obj.properties.uri) ? false : seen.add(obj.properties.uri));
    }

    isDirty(): boolean {
        return true;
        // let all = this.allGeoObjects();
        // return all.some(obj => !this.renderedObjects.includes(obj.properties.uri))
        //     || this.renderedObjects.some(uri => !all.find(geo => geo.properties.uri === uri));
    }

    geoObjectsByType(): { [key: string]: GeoObject[] } {
        let gos: { [key: string]: GeoObject[] } = {};
        var allGeoObjects = this.allGeoObjects();

        for (let i = 0; i < allGeoObjects.length; ++i) {
            let geoObject = allGeoObjects[i];

            if (gos[geoObject.properties.type] === undefined) {
                gos[geoObject.properties.type] = [];
            }

            gos[geoObject.properties.type].push(geoObject);
        }

        return gos;
    }


    public getUsaceUri(go: GeoObject): string { return ExplorerComponent.getUsaceUri(go); }

    public static getUsaceUri(go: GeoObject): string {
        if (go.properties.uri.indexOf('dime.usace.mil') !== -1) {
            return go.properties.uri;
        } else if (go.properties.uri.indexOf('georegistry') !== -1) {
            // Program
            // http://dime.usace.mil/data/program#010180
            // http://dime.usace.mil/data/program%23000510

            // Channel Reach
            // https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#ChannelReach-CESWL_AR_06_TER_5
            // http://dime.usace.mil/data/channelReach%23CESWT_AR_16_WBF_13

            // Project
            // https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#Project-30000574
            // http://dime.usace.mil/data/remis_project%23PROJ644

            let uri = go.properties.uri
                .replace("https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#", "http://dime.usace.mil/data/");

            if (uri.indexOf("Project-") !== -1) {
                uri = uri.replace("Project-", "remis_project%23");
            } else {
                uri = uri.replace("-", "%23");
            }

            if (uri.indexOf("ChannelReach") !== -1) {
                uri = uri.replace("ChannelReach", "channelReach");
            }

            return uri;
        } else {
            return go.properties.uri;
        }
    }

    public getObjectUrl(go: GeoObject): string {
        return ExplorerComponent.getObjectUrl(go);
    }

    public static getObjectUrl(go: GeoObject): string {
        if (go.properties.type.indexOf("Program") != -1
            || go.properties.type.indexOf("ChannelReach") != -1
            || go.properties.uri.indexOf("Project") != -1
            || go.properties.uri.indexOf("usace.mil") != -1
        ) {
            return "https://prism.usace-dime.net/view?uri=" + this.getUsaceUri(go);
        } else {
            return go.properties.uri;
        }
    }

    /*
     * Fit the map to the bounds of all of the layers
     */
    zoomToAll() {
        if (this.allGeoObjects().length > 0) {

            const layerBounds = this.orderedTypes.map(type => {
                // TODO: Is there a better way to get the layer data from the map?
                const data = ((this.map?.getSource(type) as GeoJSONSource)._data) as AllGeoJSON;

                return bboxPolygon(bbox(data))
            })

            const allBounds = bbox(layerBounds.reduce((a: any, b: any) => {
                return union(a.geometry, b.geometry) as any
            }, layerBounds[0].geometry)) as LngLatBoundsLike

            this.map?.fitBounds(allBounds, { padding: 50 })
        }
    }

    /*
     * Zooms to a specific GeoObject
     */
    zoomTo(uri: string) {
        let geoObject = this.allGeoObjects().find(go => go.properties.uri === uri);
        if (geoObject == null) return;

        let geojson = geoObject.geometry as any;

        const geometryType = geojson.type.toUpperCase();

        if (geometryType === "MULTIPOINT" || geometryType === "POINT") {
            let coords = geojson.coordinates;

            if (coords) {
                let bounds = new LngLatBounds();
                coords.forEach((coord: any) => {
                    bounds.extend(coord);
                });

                let center = bounds.getCenter();
                let pt = new LngLat(center.lng, center.lat);

                this.map?.flyTo({
                    center: pt,
                    zoom: 9,
                    essential: true
                });
            }
        } else if (geometryType === "MULTIPOLYGON" || geometryType === "MIXED") {
            let coords = geojson.coordinates;

            if (coords) {
                let bounds = new LngLatBounds();
                coords.forEach((polys: any) => {
                    polys.forEach((subpoly: any) => {
                        subpoly.forEach((coord: any) => {
                            bounds.extend(coord);
                        });
                    });
                });

                this.map?.fitBounds(bounds, {
                    padding: 20
                });
            }
        } else if (geometryType === "POLYGON") {
            let coords = geojson.coordinates;

            if (coords) {
                let bounds = new LngLatBounds();
                coords.forEach((polys: any) => {
                    polys.forEach((coord: any) => {
                        bounds.extend(coord);
                    });
                });

                this.map?.fitBounds(bounds, {
                    padding: 20
                });
            }
        } else if (geometryType === "LINE" || geometryType === "MULTILINE") {
            let coords = geojson.coordinates;

            if (coords) {
                let bounds = new LngLatBounds();
                coords.forEach((lines: any) => {
                    lines.forEach((subline: any) => {
                        subline.forEach((coord: any) => {
                            bounds.extend(coord);
                        });
                    });
                });

                this.map?.fitBounds(bounds, {
                    padding: 20
                });
            }
        } else if (geometryType === "MULTILINESTRING") {
            let coords = geojson.coordinates;

            if (coords) {
                let bounds = new LngLatBounds();
                coords.forEach((lines: any) => {
                    lines.forEach((lngLat: any) => {
                        bounds.extend(lngLat);
                    });
                });

                this.map?.fitBounds(bounds, {
                    padding: 20
                });
            }
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.orderedTypes, event.previousIndex, event.currentIndex);

        for (let i = 0; i < this.orderedTypes.length; ++i) {
            this.map?.moveLayer(this.orderedTypes[i], i > 0 ? this.orderedTypes[i - 1] : undefined);
            this.map?.moveLayer(this.orderedTypes[i] + "-LABEL", i > 0 ? this.orderedTypes[i - 1] + "-LABEL" : undefined);
        }
    }

    /*
      async onFileChange(e: any) {
        const file:File = e.target.files[0];
     
        if (file != null)
        {
            this.loadRdf(file);
        }
      }
     
      async loadRdf(file: File) {
        this.loading = true;
     
        let text = await file.text();
        this.tripleStore = new Store();
     
        const parser = new Parser();
        parser.parse(text, (error, quad, prefixes) => {
            if (error)
            {
                console.log(error);
                this.importError = error.message;
                this.loading = false;
            }
            else if (quad) {
                this.tripleStore?.add(quad);
            }
            else {
                console.log("Successfully loaded " + this.tripleStore?.size + " quads into memory.");
                this.loading = false;
                this.modalRef?.hide();
            }
        });
      }
      */

    initializeMap() {
        const layer = this.baseLayers[0];

        const mapConfig: any = {
            container: "map",
            style: {
                version: 8,
                name: layer.name,
                metadata: {
                    "mapbox:autocomposite": true
                },
                sources: {
                    mapbox: {
                        'type': 'raster',
                        'tiles': [
                            'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=' + "pk.eyJ1IjoianVzdGlubGV3aXMiLCJhIjoiY2l0YnlpdWRkMDlkNjJ5bzZuMTR3MHZ3YyJ9.Ad0fQd8onRSYR9QZP6VyUw"
                        ],
                        'tileSize': 512
                    }
                },
                glyphs: "http://rdf-explorer.s3-website-us-west-2.amazonaws.com/glyphs/{fontstack}/{range}.pbf",
                layers: [
                    {
                        id: layer.id,
                        type: "raster",
                        source: "mapbox",
                        'minzoom': 0,
                        'maxzoom': 22
                        // "source-layer": "mapbox_satellite_full"
                    }
                ]
            },
            attributionControl: false
        };

        mapConfig.logoPosition = "bottom-right";

        this.map = new Map(mapConfig);

        this.map!.on("load", () => {
            this.initMap();

            this.initialized = true;
        });

        this.map.on('mousemove', this.highlightSelectedLayerOnMouseMove);
    }

    highlightSelectedLayerOnMouseMove = debounce((e: any) => {
        let layer = this.getLayerUnderCursor(e);

        if (layer) {
            const uri = layer.properties['uri'];
            const highlightedObject = this.allGeoObjects().find(go => go.properties.uri === uri);
            this.store.dispatch(ExplorerActions.highlightGeoObject({ object: highlightedObject! }));
            this.map!.getCanvas().style.cursor = 'pointer';
        } else {
            // Reset if no valid feature is found
            if (this.highlightedObject) {
                this.store.dispatch(ExplorerActions.highlightGeoObject(null));
                this.map!.getCanvas().style.cursor = '';
            }
        }
    }, 5);

    getLayerUnderCursor(e: any): MapGeoJSONFeature | null | undefined {
        const features = this.map!.queryRenderedFeatures(e.point);

        if (features && features.length > 0) {
            // Get the map's layer order
            const layerOrder = this.map!.getStyle().layers!.map(layer => layer.id);

            // Sort features based on layer order, but push label layers to the bottom
            features.sort((a, b) => {
                const aIsLabel = a.layer.id.endsWith('-LABEL');
                const bIsLabel = b.layer.id.endsWith('-LABEL');

                if (aIsLabel && !bIsLabel) return 1;  // Move labels down
                if (!aIsLabel && bIsLabel) return -1; // Move non-labels up

                // Otherwise, sort by layer order (higher index = top-most)
                return layerOrder.indexOf(b.layer.id) - layerOrder.indexOf(a.layer.id);
            });

            // Take the highest non-label feature
            return features.find(f => f.properties['uri'] != null);
        }

        return null;
    }

    initMap(): void {
        // Add zoom and rotation controls to the map.
        this.map!.addControl(new AttributionControl({ compact: true }), "bottom-right");
        this.map!.addControl(new NavigationControl({ visualizePitch: true }), "bottom-right");

        this.map!.on('click', (e) => {
            this.handleMapClickEvent(e);
        });
    }

    handleMapClickEvent(e: any): void {
        let layer = this.getLayerUnderCursor(e);

        if (layer) {
            let uri = layer.properties['uri'];

            // const source = this.map!.getSource(feature.source);

            // // Get the layer definition
            // if (source?.type === 'vector') {
            //     this.vectorLayers$.pipe(take(1)).subscribe(layers => {
            //         layers.forEach(layer => {
            //             this.map!.removeFeatureState({ source: layer.id, sourceLayer: layer.sourceLayer });
            //         })

            //         const layer = layers.find(l => l.id === feature.source);

            //         if (layer != null) {
            //             const uri = layer.prefix + feature.properties[layer.codeProperty];

            //             this.explorerService.getAttributes(uri)
            //                 .then(geoObject => {
            //                     this.map!.setFeatureState({ source: layer.id, sourceLayer: layer.sourceLayer, id: feature.properties[layer.codeProperty] }, { selected: true });

            //                     this.selectedObject = geoObject;
            //                     this.store.dispatch(ExplorerActions.selectGeoObject({ object: geoObject, zoomMap: false }));
            //                 })
            //                 .catch(error => this.errorService.handleError(error))
            //         }
            //     })
            // }
            // else {
                let selectedObject = this.allGeoObjects().find(n => n.properties.uri === uri);
                this.store.dispatch(ExplorerActions.selectGeoObject({ object: selectedObject!, zoomMap: false }));
            // }
        } else {
            this.store.dispatch(ExplorerActions.selectGeoObject(null));
        }
    }

    renderHighlights() {
        if (this.selectedObject != null) {
            this.map!.setFeatureState({ source: this.selectedObject.properties.type, id: this.selectedObject.id }, { selected: true });
        }
    }

    highlightObject(uri?: string) {
        var highlightedObject = (uri == null) ? null : this.allGeoObjects().find(go => go.properties.uri === uri);

        if (highlightedObject != null)
            this.map!.setFeatureState({ source: highlightedObject.properties.type, id: highlightedObject.id }, { selected: true });
        if (this.highlightedObject != null
            && (highlightedObject == null || this.highlightedObject.properties.uri !== highlightedObject?.properties.uri)
            && (this.selectedObject == null || this.highlightedObject.properties.uri !== this.selectedObject?.properties.uri))
            this.map!.setFeatureState({ source: this.highlightedObject.properties.type, id: this.highlightedObject.id }, { selected: false });

        this.highlightedObject = highlightedObject;
    }

    selectObject(uri?: string, zoomTo = false) {
        if (this.selectedObject != null && this.selectedObject.properties.uri === uri) return;

        let previousSelected = this.selectedObject;

        if (uri != undefined) {
            let go = this.allGeoObjects().find(go => go.properties.uri === uri);
            if (go == null) return;

            this.selectedObject = go;

            if (zoomTo)
                this.zoomTo(uri);
        } else {
            this.selectedObject = undefined;
        }

        this.renderHighlights();

        if (previousSelected != null && previousSelected != this.selectedObject) {
            this.map!.setFeatureState({ source: previousSelected.properties.type, id: previousSelected.id }, { selected: false });
        }


        // if (this.selectedObject != null) {
        //     setTimeout(() => {
        //         // this.graphExplorer.renderGeoObjects(this, this.allGeoObjects());
        //         this.graphExplorer.renderGeoObjectAndNeighbors(this, this.selectedObject!);

        //         // if (uri)
        //         //     setTimeout(() => { this.graphExplorer.zoomToUri(uri); }, 500);
        //     }, 1);
        // }
    }

    toggleVectorLayer(layer: VectorLayer): void {
        const newLayer = { ...layer };
        newLayer.enabled = !newLayer.enabled

        this.store.dispatch(ExplorerActions.setVectorLayer({ layer: newLayer }));
    }
}
