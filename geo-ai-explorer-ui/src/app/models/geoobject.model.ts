import { GeoJSONGeometry } from "wellknown";

export interface GeoObject {
    type: string,
    geometry: GeoJSONGeometry,
    properties: {
        id: number;
        uri: string,
        type: string,
        label: string,
        edges: { [key: string]: [string] }, [key: string]: any
    }
}
