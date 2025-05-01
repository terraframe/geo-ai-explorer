import { Injectable } from '@angular/core';
import { ExplorerComponent, } from '../explorer/explorer.component';
import { parse, GeoJSONGeometry } from 'wellknown';
import { GeoObject } from '../models/geoobject.model';
import { MockUtil } from '../mock-util';
import { GprGraph } from '../graph-explorer/graph-explorer.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { LocationPage } from '../models/chat.model';

export interface SPARQLResultSetBinding {
    type: string, value: string, datatype?: string
}

export interface SPARQLResultSet {
    head: { vars: [string] };
    results: {
        bindings: [ {
            [key: string] : SPARQLResultSetBinding
        } ]
    };
}

export interface ExplorerInit {

}

@Injectable({
  providedIn: 'root'
})
export class ExplorerService {

  public sparqlUrl: string = "http://staging-georegistry.geoprism.net:3030/usace/sparql";

  constructor(private http: HttpClient) { }

  init(): Promise<ExplorerInit> {
    return new Promise<ExplorerInit>((resolve) => {
        setTimeout(() => {
            resolve(MockUtil.explorerInit);
        }, 3000); // Simulating 3-second network delay
    });
  }

  neighborQuery(uri: string, excludedTypes: string[] | undefined = undefined): Promise<GprGraph> {
    let sExcludedTypes = null;
    if (excludedTypes != undefined) {
        sExcludedTypes = excludedTypes.join(",");
    }

    // return new Promise<GprGraph>((resolve) => {
    //     setTimeout(() => {
    //         resolve(MockUtil.explorerInit);
    //     }, 3000); // Simulating 3-second network delay
    // });

    // Uncomment below to make a real HTTP request
    return firstValueFrom(this.http.post<GprGraph>(environment.apiUrl + 'api/neighbors', { uri: uri, excludedTypes: sExcludedTypes }));
  }

  fullTextLookup(query: string): Promise<LocationPage> {
    return firstValueFrom(this.http.post<LocationPage>(environment.apiUrl + 'api/full-text-lookup', { query: query }));
  }

  async query(sparqlText: string): Promise<SPARQLResultSet> {
    const url = `${this.sparqlUrl}?query=${encodeURIComponent(sparqlText)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  }

  convert(rs: SPARQLResultSet) : GeoObject[] {
    let geoObjects: GeoObject[] = [];
    
    rs.results.bindings.forEach(r => {
        let geoObject: GeoObject | null | undefined = null;
        let readGeoObjectUri: boolean = false;
        let lastReadUri: string | null = null;
        // rs.head.vars.forEach(v => {
        for (let i: number = 0; i < rs.head.vars.length; ++i) {
            let v = rs.head.vars[i];
            if (r[v] == null) continue;

            if (r[v].type === "uri" && r[v].value === ExplorerComponent.GEO_FEATURE) {
                lastReadUri = null;
                readGeoObjectUri = false;
            } else {
                if (i > 0 && r[v].type === "uri" && r[rs.head.vars[i-1]].value === ExplorerComponent.GEO_FEATURE) {
                    let uri = r[rs.head.vars[i+1]].value;

                    geoObject = geoObjects.find(go => go.properties.uri === uri);
                    if (geoObject == null) {
                        geoObject = {
                            type: "Feature",
                            geometry: null,
                            properties: { uri: Math.random().toString(16).slice(2), edges: {} }
                        } as unknown as GeoObject;
                        geoObjects.push(geoObject);
                    }

                    geoObject.properties.type = r[v].value;
                    geoObject.properties.uri = uri;
                    readGeoObjectUri = true;
                    i++;
                } else if (geoObject == null) {
                    throw new Error("Attempt to read property without associated geo feature. Does your query start with a geo:feature declaration?");
                } else if (r[v].type === "literal" && r[v].datatype === ExplorerComponent.GEO_WKT_LITERAL) {
                    geoObject.geometry = this.wktToGeometry(r[v].value);
                } else if (r[v].type === "literal") {
                    geoObject.properties.label = r[v].value;
                } else if (r[v].type === "uri" && readGeoObjectUri) {
                    if (lastReadUri == null) {
                        lastReadUri = r[v].value;
                    } else {
                        if (geoObject.properties.edges[lastReadUri] == null) {
                            geoObject.properties.edges[lastReadUri] = [] as any;
                        }
                        if (geoObject.properties.edges[lastReadUri].indexOf(r[v].value) === -1) {
                            geoObject.properties.edges[lastReadUri].push(r[v].value);
                        }

                        lastReadUri = null;
                    }
                }
            }
        };
    });

    geoObjects.forEach(go => go.properties.label = (go.properties.label != null && go.properties.label != "") ? go.properties.label : go.properties.uri.substring(go.properties.uri.lastIndexOf("#")+1));

    // console.log(this.geoObjects);

    return geoObjects;
  }

  wktToGeometry(wkt: string): GeoJSONGeometry
  {
    if (wkt.indexOf("<") != -1 && wkt.indexOf(">") != -1)
        wkt = wkt.substring(wkt.indexOf(">") + 1).trim();

    let geojson = parse(wkt);

    return geojson as GeoJSONGeometry;
  }
  

  getAttributes(uri: string, includeGeometry: boolean = false, hasPrefix: boolean = true): Promise<GeoObject> {

    // Uncomment below to make a real HTTP request
    let params = new HttpParams();
    params = params.append("uri", uri);
    params = params.append("includeGeometry", includeGeometry);
    params = params.append("hasPrefix", hasPrefix);

    return firstValueFrom(this.http.get<GeoObject>(environment.apiUrl + 'api/get-attributes', { params }));
  }
}
