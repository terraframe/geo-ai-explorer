import { GeoJSONGeometry } from "wellknown";

export interface GeoObject {
    type: string,
    geometry: GeoJSONGeometry,
    id: string
    properties: {
        uri: string,
        type: string,
        label: string,
        edges: { [key: string]: [string] }, [key: string]: any
    }
}
