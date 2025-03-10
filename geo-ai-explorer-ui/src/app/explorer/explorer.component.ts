import { Component, AfterViewInit, TemplateRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { Map, NavigationControl, AttributionControl, LngLatBounds, LngLat, GeoJSONSource, LngLatBoundsLike } from "maplibre-gl";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import JSON5 from 'json5'
// @ts-ignore
import ColorGen from "color-generator";
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { Observable, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { GeoObject } from '../models/geoobject.model';
import { StyleConfig } from '../models/style.model';

import { AttributePanelComponent } from '../attribute-panel/attribute-panel.component';
import { AichatComponent } from '../aichat/aichat.component';
import { ResultsTableComponent } from '../results-table/results-table.component';
import { selectObjects, selectedObject, selectStyles } from '../state/explorer.selectors';
import { StyleService } from '../service/style-service.service';
import { ExplorerActions } from '../state/explorer.actions';
import { GraphExplorerComponent } from '../graph-explorer/graph-explorer.component';
import { defaultQueries, SELECTED_COLOR } from './defaultQueries';
import { AllGeoJSON, bbox, bboxPolygon, union } from '@turf/turf';
import { ExplorerService } from '../service/explorer.service';


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
        PanelModule
    ],
    templateUrl: './explorer.component.html',
    styleUrl: './explorer.component.scss'
})
export class ExplorerComponent implements OnInit, OnDestroy, AfterViewInit {

    public static GEO = "http://www.opengis.net/ont/geosparql#";

    public static GEO_FEATURE = ExplorerComponent.GEO + "Feature";

    public static GEO_WKT_LITERAL = ExplorerComponent.GEO + "wktLiteral";

    private store = inject(Store);

    geoObjects$: Observable<GeoObject[]> = this.store.select(selectObjects);

    geoObjects: GeoObject[] = [];

    onGeoObjectsChange: Subscription;

    styles$: Observable<StyleConfig> = this.store.select(selectStyles);

    onStylesChange: Subscription;

    selectedObject$: Observable<GeoObject | null> = this.store.select(selectedObject);

    onSelectedObjectChange: Subscription;

    resolvedStyles: StyleConfig = {};

    @ViewChild("graphExplorer") graphExplorer!: GraphExplorerComponent;

    map?: Map;

    // file?: string;

    importError?: string;

    public defaultQueries = defaultQueries;

    public loading: boolean = false;

    public typeLegend: { [key: string]: { label: string, color: string } } = {};

    public selectedObject?: GeoObject;

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

    constructor(private styleService: StyleService, private explorerService: ExplorerService) {
        this.onGeoObjectsChange = this.geoObjects$.subscribe(geoObjects => {
            this.geoObjects = geoObjects;

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


        })

        this.onStylesChange = this.styles$.subscribe(styles => {
            this.resolvedStyles = styles;

            this.render();
        });

        this.onSelectedObjectChange = this.selectedObject$.subscribe(obj => {
            this.selectObject(obj == null ? undefined : obj!.properties.uri, true);
        });
    }

    ngOnInit(): void {
        // TODO : Invoke explorerService.init instead
        this.styleService.getStyles().then(styles => {
            this.store.dispatch(ExplorerActions.setStyles({ styles }));
        })
    }

    ngOnDestroy(): void {
        this.onGeoObjectsChange.unsubscribe();
        this.onStylesChange.unsubscribe();
    }

    ngAfterViewInit() {
        this.initializeMap();
    }

    render(): void {
        if (this.initialized) {
            const types = Object.keys(this.geoObjectsByType());

            // Order the types by the order defined in their style config
            this.orderedTypes = types.sort((a, b) => {
                return (this.resolvedStyles[a]?.order ?? 999) - (this.resolvedStyles[b]?.order ?? 999);
            });

            this.calculateTypeLegend();

            this.mapGeoObjects();

            // Fit the map to the bounds of all of the layers
            if (this.geoObjects.length > 0) {

                const layerBounds = this.orderedTypes.map(type => {
                    // TODO: Is there a better way to get the layer data from the map?
                    const data = ((this.map?.getSource(type) as GeoJSONSource)._data) as AllGeoJSON;

                    return bboxPolygon(bbox(data))
                })

                if (layerBounds.length > 1) {
                    const allBounds = bbox(layerBounds.reduce((a: any, b: any) => {
                        return union(a, b) as any
                    }, layerBounds[0])) as LngLatBoundsLike

                    this.map?.fitBounds(allBounds, { padding: 50 })
                }
                else {
                    this.map?.fitBounds(bbox(layerBounds[0]) as LngLatBoundsLike, { padding: 50 })
                }

            }

            // if (this.graphExplorer)
            //     this.graphExplorer.renderGeoObjects(this, this.geoObjects);
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
        console.log(uri)

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

    mapGeoObjects() {
        this.clearAllMapData();

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

        for (let i = this.orderedTypes.length - 1; i >= 0; --i) {
            let type = this.orderedTypes[i];
            let geoObjects = gosByType[type];

            if (geoObjects.length == 0) continue;
            if (geoObjects[0].geometry == null) continue; // TODO : Find this out at the type level...

            let geojson: any = {
                type: "FeatureCollection",
                features: []
            }

            for (let i = 0; i < this.geoObjects.length; ++i) {
                if (this.geoObjects[i].properties.type !== type) continue;

                let geoObject = this.geoObjects[i];

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

    geoObjectsByType(): { [key: string]: GeoObject[] } {
        let gos: { [key: string]: GeoObject[] } = {};

        for (let i = 0; i < this.geoObjects.length; ++i) {
            let geoObject = this.geoObjects[i];

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

    zoomTo(uri: string) {
        let geoObject = this.geoObjects.find(go => go.properties.uri === uri);
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

        this.map.on("load", () => {
            this.initMap();

            this.initialized = true;
        });
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
        const features = this.map!.queryRenderedFeatures(e.point);

        if (features != null && features.length > 0) {
            const feature = features[0];

            if (feature.properties['uri'] != null) {
                let uri = feature.properties['uri'];
                this.selectObject(uri);
            }
        } else {
            this.selectObject();
        }
    }

    selectObject(uri?: string, zoomTo = false) {
        let previousSelected = this.selectedObject;

        if (uri != undefined) {
            let go = this.geoObjects.find(go => go.properties.uri === uri);
            if (go == null) return;

            this.selectedObject = go;

            if (zoomTo)
                this.zoomTo(uri);
        } else {
            this.selectedObject = undefined;
        }

        if (this.selectedObject != null) {
            this.map!.setFeatureState({ source: this.selectedObject.properties.type, id: this.selectedObject.id }, { selected: true });
        }

        if (previousSelected != null && previousSelected != this.selectedObject) {
            this.map!.setFeatureState({ source: previousSelected.properties.type, id: previousSelected.id }, { selected: false });
        }

        if (this.selectedObject != null) {
            setTimeout(() => {
                // this.graphExplorer.renderGeoObjects(this, this.geoObjects);
                this.graphExplorer.renderGeoObjectAndNeighbors(this, this.selectedObject!);

                // if (uri)
                //     setTimeout(() => { this.graphExplorer.zoomToUri(uri); }, 500);
            }, 1);
        }
    }

}
