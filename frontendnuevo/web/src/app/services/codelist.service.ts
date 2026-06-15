import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodelistService {
  constructor(private apiService: ApiService) {}

  getBarrios(): Observable<any> { return this.apiService.get('/codelist/barrios/'); }
  getTiposResiduo(): Observable<any> { return this.apiService.get('/codelist/tipos-residuo/'); }
  getTiposPavimento(): Observable<any> { return this.apiService.get('/codelist/tipos-pavimento/'); }
  getTiposMantenimiento(): Observable<any> { return this.apiService.get('/codelist/tipos-mantenimiento/'); }
}