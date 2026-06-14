import { Injectable } from '@angular/core';

//To be able to set http requests

import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })

  constructor(public settingsService:SettingsService, private httpClient:HttpClient) { }

  get(endPointUrl:string, getParams:HttpParams=new HttpParams({})){
    return this.httpClient.get<any>(this.settingsService.API_URL + endPointUrl,
      {
        headers: this.headers, 
        responseType : 'json', 
        reportProgress: false,
        params: getParams,
        withCredentials: true, //withCredentials. Necessary to send cookies: sessionid, csrf, ...
      })
  }

  post(endPointUrl:string, postParams:{}={}){
    var postData = this.generarHttpParamsDesdeObjeto(postParams);
    console.log('postParams',postParams);
    console.log('postData',postData);

      return this.httpClient.post<any>(
        this.settingsService.API_URL + endPointUrl,
        postData,
        { headers: this.headers, 
          responseType : 'json', 
          reportProgress: false,
          withCredentials: true, //withCredentials. Necessary to send cookies: sessionid, csrf, ...
        }
      )
  }

  put(endPointUrl:string, putParams:{}={}){
    var putData = this.generarHttpParamsDesdeObjeto(putParams);
    return this.httpClient.put<any>(
      this.settingsService.API_URL + endPointUrl,
      putData,
      { headers: this.headers, 
        responseType : 'json', 
        reportProgress: false,
        withCredentials: true,
      }
    )
  }

  delete(endPointUrl:string){
    return this.httpClient.delete<any>(
      this.settingsService.API_URL + endPointUrl,
      { headers: this.headers, 
        responseType : 'json', 
        reportProgress: false,
        withCredentials: true,
      }
    )
  }

  private generarHttpParamsDesdeObjeto(data: { [key: string]: string | number }): string {
    /**
     * Gets a string of HttpParams from an object.
     * By default angular sends the data in request.body
     *    in this way it senfs the data in the body of the request request.BODY, as
     *    django expects.
     * You need also to set the headers in the request
     *    'Content-Type': 'application/x-www-form-urlencoded'
     * @param data: an object with key-value pairs {'key': 'value', 'key2': 'value2', ...}
     * @example {id: '', description: 'gg', area: '236', geom: 'polygon((0 0, 1 0, 1 1, 0 0))'}
     * @returns {string}: id=&description=gg&area=236&geom=polygon((0%200,%201%200,%201%201,%200%200))
     * @description
     * This function takes an object and converts it into a string of HttpParams.
     */
    let params = new HttpParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params = params.set(key, data[key].toString()); // Convertimos el valor a string
      }
    }
    return params.toString();
  }
}

