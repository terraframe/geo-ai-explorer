import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../environments/environment';
import { StyleConfig } from '../models/style.model';
import { MockUtil } from '../mock-util';
import { VectorLayer } from '../models/vector-layer.model';
import { Configuration } from '../models/configuration.model';

@Injectable({
  providedIn: 'root',
})
export class StyleService {

  constructor(private http: HttpClient) {
  }

  get(): Promise<Configuration> {

    // return new Promise<StyleConfig>((resolve) => {
    //   setTimeout(() => {
    //     // Simulated server response
    //     resolve(MockUtil.styles);
    //   }, 3000); // Simulating 3-second network delay
    // });

    // Uncomment below to make a real HTTP request
    return firstValueFrom(this.http.get<Configuration>(environment.apiUrl + 'api/configuration/get')).then(configuration => {
      configuration.layers.map(l => l.id = uuidv4())
      
      return configuration;
    });;
  }



  getStyles(): Promise<StyleConfig> {

    // return new Promise<StyleConfig>((resolve) => {
    //   setTimeout(() => {
    //     // Simulated server response
    //     resolve(MockUtil.styles);
    //   }, 3000); // Simulating 3-second network delay
    // });

    // Uncomment below to make a real HTTP request
    return firstValueFrom(this.http.get<StyleConfig>(environment.apiUrl + 'api/configuration/styles'));
  }

  getVectorLayers(): Promise<VectorLayer[]> {

    // return new Promise<StyleConfig>((resolve) => {
    //   setTimeout(() => {
    //     // Simulated server response
    //     resolve(MockUtil.styles);
    //   }, 3000); // Simulating 3-second network delay
    // });

    // Uncomment below to make a real HTTP request
    return firstValueFrom(this.http.get<VectorLayer[]>(environment.apiUrl + 'api/configuration/vector-layers')).then(layers => {
      layers.map(l => l.id = uuidv4())

      return layers;
    });
  }

}