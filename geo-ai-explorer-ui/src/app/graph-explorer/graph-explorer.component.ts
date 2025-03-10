import { Component, inject, ViewChild } from '@angular/core';
import { ExplorerComponent } from '../explorer/explorer.component';
import { CommonModule } from '@angular/common';
import { Edge, Node, GraphComponent, GraphModule } from '@swimlane/ngx-graph';
import { defaultQueries, SELECTED_COLOR } from '../explorer/defaultQueries';
import { ExplorerService, SPARQLResultSet } from '../service/explorer.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
// @ts-ignore
import ColorGen from "color-generator";
import { GeoObject } from '../models/geoobject.model';
import { ExplorerActions } from '../state/explorer.actions';
import { Store } from '@ngrx/store';

// export interface Relationship {
//   oid: string,
//   label: string,
//   layout: "VERTICAL" | "HORIZONTAL",
//   code: string,
//   type?: string
// }

// export interface Vertex {
//   label: string;
//   uri: string;
//   typeUri: string;
// }

// export interface Edge {
//   typeUri: string,
//   sourceUri: string,
//   targetUri: string
// }

// export interface RelatedType {
//   code: string,
//   label: string,
//   objectType: "BUSINESS" | "GEOOBJECT"
// }

export interface GprGraph {
  nodes: GeoObject[],
  edges: { source: string, target: string, type: string }[]
}

export interface TreeData {
  edges: Edge[],
  nodes: Node[],
  // relatedTypes: RelatedType[]
}

export const DRAW_SCALE_MULTIPLIER: number = 1.0;

export const GRAPH_GO_LABEL_COLOR: string = "black";
export const GRAPH_CIRCLE_FILL: string = "#999";
export const GRAPH_LINE_COLOR: string = "#999";

export const COLLAPSE_ANIMATION_TIME: number = 500; // in ms

export const DIMENSIONS = {
    NODE: { WIDTH: 30, HEIGHT: 30 },
    LABEL: { WIDTH: 100, HEIGHT: 60, FONTSIZE: 14 },
    PADDING: {
        BETWEEN_NODES: 0,
        NODE_LABEL: 5,
        NODE_EDGE: 5
    }
};

@Component({
    selector: 'graph-explorer',
    imports: [CommonModule, GraphModule, ProgressSpinnerModule],
    providers: [],
    templateUrl: './graph-explorer.component.html',
    styleUrl: './graph-explorer.component.scss'
})
export class GraphExplorerComponent {

  @ViewChild("graph") graph!: GraphComponent;

  private store = inject(Store);

  private HASH_TAG_REPLACEMENT = "-!`~`!-";

  public DIMENSIONS = DIMENSIONS;

  public SELECTED_NODE_COLOR = SELECTED_COLOR;

  public loading:boolean = false;

  public svgHeight: number | null = null;
  public svgWidth: number | null = null;

  // public geoObjects?: GeoObject[];
  public data?: TreeData;

  public relationship: any = { layout: "HORIZONTAL" }

  public explorer?: ExplorerComponent;

  private extraColors: any = {};

  private gprGraph?: GprGraph;

  constructor(private queryService: ExplorerService) {
  }

  public async renderGeoObjectAndNeighbors(explorer: ExplorerComponent, geoObject: GeoObject) {
      this.loading = true;

      // let sparql = defaultQueries[2].sparql.replace("{{uri}}", geoObject.properties.uri);
      // const result: SPARQLResultSet = await this.queryService.query(sparql);
      // this.geoObjects = this.queryService.convert(result);

      // if (this.geoObjects.length === 0) {
      //   console.error('The query did not return any results!');
      //   return;
      // }

      // this.renderGeoObjects(explorer, this.geoObjects);

      let graph = this.queryService.neighborQuery(geoObject.properties.uri).then((graph) => {
        this.store.dispatch(ExplorerActions.selectGeoObject({ object: geoObject }));
        this.renderGraph(explorer, graph);

        // setTimeout(() => { this.zoomToUri(geoObject.properties.uri); }, 500);
      }).catch((e) => {
        console.error(e);
      }).finally(() => {
        this.loading = false;
      });
  }

  public renderGraph(explorer: ExplorerComponent, graph: GprGraph) {
    this.explorer = explorer;
    this.gprGraph = graph;

    let data: any = {
        edges: [],
        nodes: []
    };

    graph.nodes.forEach(go => {
        let node = {
            label: (go.properties.label != null && go.properties.label !== "") 
                ? go.properties.label 
                : go.properties.uri.substring(go.properties.uri.lastIndexOf("#") + 1),
            id: this.uriToId(go.properties.uri),
            relation: graph.edges.some(edge => edge.source === go.properties.uri) ? "PARENT" : "CHILD",
            type: go.properties.type
        };
        data.nodes.push(node);
    });

    graph.edges.forEach(edge => {
        let formattedEdge = {
            id: this.uriToId(Math.random().toString(16).slice(2)),
            source: this.uriToId(edge.source),
            target: this.uriToId(edge.target),
            label: ExplorerComponent.uriToLabel(edge.type)
        };
        data.edges.push(formattedEdge);
    });

    window.setTimeout(() => {
      this.data = data;
      this.resizeDimensions();
      // this.calculateTypeLegend(this.data.relatedTypes);
      // this.addLayers(this.data.relatedTypes);
    }, 100);

    this.resizeDimensions();
}


  // public renderGeoObjects(explorer: ExplorerComponent, geoObjects: GeoObject[]) {
  //   this.explorer = explorer;

  //   console.log(geoObjects);

  //   this.geoObjects = geoObjects;
  //   let data: any = {
  //     edges: [],
  //     nodes: []
  //   }

  //   geoObjects.forEach(go => {

  //     let node = {
  //       label: (go.properties.label != null && go.properties.label != "") ? go.properties.label : go.properties.uri.substring(go.properties.uri.lastIndexOf("#")+1),
  //       id: this.uriToId(go.properties.uri),
  //       relation: Object.entries(go.properties.edges).length == 0 ? "CHILD" : "PARENT",
  //       type: go.properties.type
  //     };
  //     data.nodes.push(node);

  //     for (const [key, value] of Object.entries(go.properties.edges)) {
  //       // if (value === go.properties.uri) { continue; }

  //       value.forEach(v => {
  //         let edge = {
  //           id: this.uriToId(Math.random().toString(16).slice(2)),
  //           source: this.uriToId(go.properties.uri),
  //           target: this.uriToId(v),
  //           label: ExplorerComponent.uriToLabel(key)
  //         };
  //         data.edges.push(edge);
  //       });
  //     }
  //   });

  //   window.setTimeout(() => {
  //       this.data = data;
  //       this.resizeDimensions();
  //       // this.calculateTypeLegend(this.data.relatedTypes);
  //       // this.addLayers(this.data.relatedTypes);
  //   }, 0);

  //   this.resizeDimensions();
  // }

  public getTypeLegend() {
    return this.explorer?.getTypeLegend();
  }

  public getColor(node: any) {
    var legend = this.getTypeLegend()!;

    if (legend[node.type] != null)
      return legend[node.type].color;
    else if (this.extraColors[node.type] != null)
      return this.extraColors[node.type];
    else {
      this.extraColors[node.type] = ColorGen().hexString();
      return this.extraColors[node.type];
    }
  }

  public getSelectedId() {
    if (this.explorer?.selectedObject == null) return null;

    return this.uriToId(this.explorer!.selectedObject.properties.uri);
  }

  uriToId(uri: string): string {
    return "a" + uri;
  }

  idToUri(id: string): string {
    return id.substring(1);
  }

  resizeDimensions(): void {
    let graphContainer = document.getElementById("graph-container");

    if (graphContainer) {
        this.svgHeight = graphContainer.clientHeight - 50;
        this.svgWidth = graphContainer.clientWidth;
    }
  }

  // Thanks to https://stackoverflow.com/questions/52172067/create-svg-hexagon-points-with-only-only-a-length
  public getHexagonPoints(node: { dimension: { width: number, height: number }, relation: string }): string {
      let y = (this.DIMENSIONS.LABEL.HEIGHT / 2) - this.DIMENSIONS.NODE.HEIGHT / 2;
      let x = (this.relationship.layout === "VERTICAL")
          ? (node.relation === "CHILD" ? (this.DIMENSIONS.LABEL.WIDTH / 2) - this.DIMENSIONS.NODE.WIDTH / 2 : (this.DIMENSIONS.LABEL.WIDTH + DIMENSIONS.PADDING.NODE_LABEL + this.DIMENSIONS.NODE.WIDTH) / 2 - this.DIMENSIONS.NODE.WIDTH / 2)
          : node.relation === "PARENT" ? (this.DIMENSIONS.LABEL.WIDTH + this.DIMENSIONS.PADDING.NODE_LABEL + this.DIMENSIONS.PADDING.NODE_EDGE) : 0;

      let radius = this.DIMENSIONS.NODE.WIDTH / 2;
      let height = this.DIMENSIONS.NODE.HEIGHT;
      let width = this.DIMENSIONS.NODE.WIDTH;

      let points = [0, 1, 2, 3, 4, 5, 6].map((n, i) => {
          let angleDeg = 60 * i - 30;
          let angleRad = Math.PI / 180 * angleDeg;
          return [(width / 2 + radius * Math.cos(angleRad)) + x, (height / 2 + radius * Math.sin(angleRad)) + y];
      }).map((p) => p.join(","))
          .join(" ");

      return points;
  }

  public onClickNode(node: any) {
    // this.explorer?.selectObject(this.idToUri(node.id), true);

    let selectedObject = this.gprGraph!.nodes.find(n => n.properties.uri === this.idToUri(node.id));

    this.store.dispatch(ExplorerActions.selectGeoObject({ object: selectedObject! }));
  }

  public zoomToUri(uri: string) {
    // this.graph.zoomLevel = 10;
    // this.graph.zoomToFit();

    // this.graph.zoom(this.graph.zoomLevel - 1);
    // if (this.graph.zoomLevel)
    // console.log(this.graph.zoomLevel);

    // console.log(this.graph.zoomLevel);
    // this.graph.zoom(2);
    // console.log(this.graph.zoomLevel);

    const desiredZoomLevel = 1.1;

    this.graph.zoom(desiredZoomLevel / this.graph.zoomLevel);

    this.graph.panToNodeId(this.uriToId(uri));

    // window.setTimeout(() => {
    //   this.graph.zoom(4);
    //   this.graph.panToNodeId(this.uriToId(uri));
    // }, 10);
  }

}

