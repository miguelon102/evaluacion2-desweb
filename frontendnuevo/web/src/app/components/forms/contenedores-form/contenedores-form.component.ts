import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MapService } from '../../../services/map.service';
import { WKT } from 'ol/format';

import { CodelistService } from '../../../services/codelist.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-contenedores-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, MatAutocompleteModule, MatInputModule],
  templateUrl: './contenedores-form.component.html',
  styleUrl: './contenedores-form.component.scss'
})
export class ContenedoresFormComponent implements OnInit {
  
  contenedoresForm!: FormGroup;
  serverMessage: string = '';
  listaContenedores: any[] = [];

  barrios: any[] = [];
  residuos: any[] = [];
  barriosFiltrados!: Observable<any[]>;
  residuosFiltrados!: Observable<any[]>;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public mapService: MapService,
    public router: Router,
    private codelistService: CodelistService
  ) {}

  ngOnInit(): void {
    this.contenedoresForm = new FormGroup({
      id: new FormControl(''),
      tipo_residuo: new FormControl('', [Validators.required]),
      capacidad_litros: new FormControl('', [Validators.min(0), Validators.pattern('^[0-9]+([.][0-9]+)?$')]),
      fecha_ultima_recogida: new FormControl(''),
      estado_conservacion: new FormControl(''),
      barrio: new FormControl(''),
      geom: new FormControl('', [Validators.required])
    });

    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get('geom');
      if (geom) this.contenedoresForm.get('geom')?.setValue(geom);
    });

    // Cargar Catálogos
    this.codelistService.getBarrios().subscribe((data: any) => {
      this.barrios = data;
      this.barriosFiltrados = this.contenedoresForm.get('barrio')!.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrar(value, this.barrios))
      );
    });

    this.codelistService.getTiposResiduo().subscribe((data: any) => {
      this.residuos = data;
      this.residuosFiltrados = this.contenedoresForm.get('tipo_residuo')!.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrar(value, this.residuos))
      );
    });
  }

  private filtrar(value: any, lista: any[]): any[] {
    const filterValue = (typeof value === 'string' ? value : value?.nombre || '').toLowerCase();
    return lista.filter(item => item.nombre.toLowerCase().includes(filterValue));
  }

  displayNombre(item: any): string {
    return item && item.nombre ? item.nombre : '';
  }

  private extraerIdCodelist(valor: any, lista: any[]): number | null {
    if (!valor) return null;
    if (typeof valor === 'object' && valor.id) return valor.id;
    if (typeof valor === 'string') {
      const encontrado = lista.find(item => item.nombre.toLowerCase() === valor.toLowerCase());
      return encontrado ? encontrado.id : null;
    }
    return null;
  }

  insert(): void {
    const data = { ...this.contenedoresForm.value };
    delete data.id; 
    
    data.barrio = this.extraerIdCodelist(data.barrio, this.barrios);
    data.tipo_residuo = this.extraerIdCodelist(data.tipo_residuo, this.residuos);
    
    this.apiService.post('/smartcity/contenedores/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        this.listaContenedores = [response];
        this.mapService.getLayerByTitle('Contenedores WMS')?.getSource().updateParams({"time": Date.now()});
      },
      error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
      }
    });
  }

  selectOne(): void {
    const id = this.contenedoresForm.get('id')?.value;
    if (!id) return;
    
    this.apiService.get(`/smartcity/contenedores/${id}/`).subscribe({
      next: (response: any) => {
        this.contenedoresForm.patchValue(response);
        if (response.geom_wkt) this.contenedoresForm.get('geom')?.setValue(response.geom_wkt);
        
        if (response.barrio) {
          const bObj = this.barrios.find(b => b.id === response.barrio);
          if (bObj) this.contenedoresForm.get('barrio')?.setValue(bObj);
        }
        if (response.tipo_residuo) {
          const tObj = this.residuos.find(r => r.id === response.tipo_residuo);
          if (tObj) this.contenedoresForm.get('tipo_residuo')?.setValue(tObj);
        }

        this.listaContenedores = [response];
        this.serverMessage = `Registro ${id} cargado.`;
      }
    });
  }

  update(): void {
    const id = this.contenedoresForm.get('id')?.value;
    const data = { ...this.contenedoresForm.value };
    delete data.id;

    data.barrio = this.extraerIdCodelist(data.barrio, this.barrios);
    data.tipo_residuo = this.extraerIdCodelist(data.tipo_residuo, this.residuos);

    this.apiService.put(`/smartcity/contenedores/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. ID ${response.id} actualizado.`;
        response.geom_wkt = response.geom_wkt || data.geom;
        this.listaContenedores = [response];
        this.mapService.getLayerByTitle('Contenedores WMS')?.getSource().updateParams({"time": Date.now()});
      }
    });
  }

  delete(): void {
    const id = this.contenedoresForm.get('id')?.value;
    this.apiService.delete(`/smartcity/contenedores/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. ID ${id} eliminado.`;
        this.clean();
        this.mapService.getLayerByTitle('Contenedores WMS')?.getSource().updateParams({"time": Date.now()});
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/contenedores/').subscribe({
      next: (response: any) => {
        this.listaContenedores = response.results || response.data || (Array.isArray(response) ? response : []);
        this.serverMessage = `Select All OK. Hay ${this.listaContenedores.length} contenedores.`;
        this.dibujarEnMapa(this.listaContenedores);
      }
    });
  }

  dibujarEnMapa(lista: any[]): void {
    const vectorLayer = this.mapService.getLayerByTitle('Contenedores vector');
    const source = vectorLayer?.getSource();
    if (!source) return;

    source.clear(); 
    const wktFormat = new WKT();
    
    lista.forEach(item => {
      if (item.geom_wkt) { 
        try {
          const feature = wktFormat.readFeature(item.geom_wkt, { dataProjection: 'EPSG:25830', featureProjection: 'EPSG:25830' });
          feature.setId(item.id);                      
          feature.set('tableName', 'contenedores');    
          feature.set('attributes', item);             
          source.addFeature(feature);
        } catch (e) {}
      }
    });
  }

  cargarEnFormulario(contenedorClicado: any): void {
    this.contenedoresForm.patchValue(contenedorClicado);
    if (contenedorClicado.geom_wkt) this.contenedoresForm.get('geom')?.setValue(contenedorClicado.geom_wkt);
    
    if (contenedorClicado.barrio) {
      const bObj = this.barrios.find(b => b.id === contenedorClicado.barrio);
      if (bObj) this.contenedoresForm.get('barrio')?.setValue(bObj);
    }
    if (contenedorClicado.tipo_residuo) {
      const tObj = this.residuos.find(r => r.id === contenedorClicado.tipo_residuo);
      if (tObj) this.contenedoresForm.get('tipo_residuo')?.setValue(tObj);
    }
    this.serverMessage = `Contenedor ID ${contenedorClicado.id} cargado listo para actualizar.`;
  }

  clean(): void {
    this.contenedoresForm.reset();
    this.listaContenedores = [];
    this.serverMessage = 'Formulario y tabla vaciados.';
  }
}



