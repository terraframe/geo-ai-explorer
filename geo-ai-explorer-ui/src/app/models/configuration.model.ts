import { StyleConfig } from "./style.model";
import { VectorLayer } from "./vector-layer.model";

export interface Configuration {
    styles: StyleConfig
    layers: VectorLayer[]
}

