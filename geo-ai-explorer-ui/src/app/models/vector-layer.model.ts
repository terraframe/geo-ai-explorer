export interface VectorLayer {
    id: string;
    url: string;
    label: string;
    color: string;
    order: number;
    labelProperty: string;
    codeProperty: string;
    prefix: string;
    enabled: boolean;
    sourceLayer: string;
    geometryType: string;
}

