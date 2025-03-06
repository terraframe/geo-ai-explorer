import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { StyleConfig } from '../models/style.model';
import { MockUtil } from '../mock-util';

@Injectable({
  providedIn: 'root',
})
export class StyleService {

  constructor(private http: HttpClient) {
  }


  getStyles(): Promise<StyleConfig> {

    // return new Promise<StyleConfig>((resolve) => {
    //   setTimeout(() => {
    //     // Simulated server response
    //     resolve(MockUtil.styles);
    //   }, 3000); // Simulating 3-second network delay
    // });

    // Uncomment below to make a real HTTP request
    return firstValueFrom(this.http.get<StyleConfig>(environment.apiUrl + 'api/style/get-default'));
  }

}