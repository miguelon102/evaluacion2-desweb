import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(public settingsService: SettingsService, private httpClient: HttpClient) { }

  // 1. LIMPIADOR DE URLs: Evita el fallo del '//' concatenando limpiamente
  private getCleanUrl(endPointUrl: string): string {
    const baseUrl = this.settingsService.API_URL || ''; // <--- SOLUCIÓN: Si es undefined, usa ''
    const base = baseUrl.replace(/\/$/, ''); // Quita slash final
    const path = endPointUrl.replace(/^\//, ''); // Quita slash inicial
    return `${base}/${path}`;
  }

  // 2. INYECTOR DE LLAVES (KNOX TOKEN): Adjunta el token de seguridad si existe
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    // Recuperamos el token que guardaremos en el Login
    const token = localStorage.getItem('knox_token');
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

  get(endPointUrl: string, getParams: HttpParams = new HttpParams({})) {
    return this.httpClient.get<any>(this.getCleanUrl(endPointUrl), {
      headers: this.getHeaders(),
      responseType: 'json',
      reportProgress: false,
      params: getParams,
      withCredentials: true,
    });
  }

  post(endPointUrl: string, postParams: {} = {}) {
    var postData = this.generarHttpParamsDesdeObjeto(postParams);
    return this.httpClient.post<any>(
      this.getCleanUrl(endPointUrl),
      postData,
      { 
        headers: this.getHeaders(), 
        responseType: 'json', 
        reportProgress: false,
        withCredentials: true,
      }
    );
  }

  put(endPointUrl: string, putParams: {} = {}) {
    var putData = this.generarHttpParamsDesdeObjeto(putParams);
    return this.httpClient.put<any>(
      this.getCleanUrl(endPointUrl),
      putData,
      { 
        headers: this.getHeaders(), 
        responseType: 'json', 
        reportProgress: false,
        withCredentials: true,
      }
    );
  }

  delete(endPointUrl: string) {
    return this.httpClient.delete<any>(
      this.getCleanUrl(endPointUrl),
      { 
        headers: this.getHeaders(), 
        responseType: 'json', 
        reportProgress: false,
        withCredentials: true,
      }
    );
  }

  private generarHttpParamsDesdeObjeto(data: { [key: string]: any }): string {
    let params = new HttpParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        let value = data[key];
        
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        params = params.set(key, value.toString());
      }
    }
    return params.toString();
  }
}



