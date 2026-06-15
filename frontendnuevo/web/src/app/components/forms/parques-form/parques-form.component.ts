import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MapService } from '../../../services/map.service';
import { WKT, GeoJSON } from 'ol/format';

// --- NUEVOS IMPORTS PARA AUTOCOMPLETE ---
import { CodelistService } from '../../../services/codelist.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-parques-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, MatAutocompleteModule, MatInputModule],
  templateUrl: './parques-form.component.html',
  styleUrl: './parques-form.component.scss'
})
export class ParquesFormComponent implements OnInit {
    
  parquesForm!: FormGroup;
  serverMessage: string = '';
  listaParques: any[] = [];

  mantenimientos: any[] = [];
  mantenimientosFiltrados!: Observable<any[]>;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public mapService: MapService,
    public router: Router,
    private codelistService: CodelistService
  ) {}

  ngOnInit(): void {
    this.parquesForm = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      area_hectareas: new FormControl('', [Validators.min(0), Validators.pattern('^[0-9]+([.][0-9]+)?$')]), 
      tiene_zona_infantil: new FormControl(false),
      horario_cierre: new FormControl(''),
      tipo_mantenimiento: new FormControl(''), 
      geom: new FormControl('', [Validators.required])
    });

    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get('geom');
      if (geom) this.parquesForm.get('geom')?.setValue(geom);
    });

    // Cargar Catálogo
    this.codelistService.getTiposMantenimiento().subscribe((data: any) => {
      this.mantenimientos = data;
      this.mantenimientosFiltrados = this.parquesForm.get('tipo_mantenimiento')!.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrar(value, this.mantenimientos))
      );
    });
  }

  // --- LÓGICAS AUTOCOMPLETE ---
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

  // --- CRUD RESTO IGUAL ---
  insert(): void {
    const parqueData = { ...this.parquesForm.value };
    delete parqueData.id; 
    
    parqueData.tipo_mantenimiento = this.extraerIdCodelist(parqueData.tipo_mantenimiento, this.mantenimientos);
    
    this.apiService.post('/smartcity/parques/', parqueData).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        this.listaParques = [response];
        this.mapService.getLayerByTitle('Parques WMS')?.getSource().updateParams({"time": Date.now()});
      },
      error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
      }
    });
  }

  selectOne(): void {
    const id = this.parquesForm.get('id')?.value;
    if (!id) return;

    this.apiService.get(`/smartcity/parques/${id}/`).subscribe({
      next: (response: any) => {
        this.parquesForm.patchValue(response);
        if (response.geom_wkt) this.parquesForm.get('geom')?.setValue(response.geom_wkt);
        
        // Traducir ID a Objeto para el Autocomplete
        if (response.tipo_mantenimiento) {
          const obj = this.mantenimientos.find(m => m.id === response.tipo_mantenimiento);
          if (obj) this.parquesForm.get('tipo_mantenimiento')?.setValue(obj);
        }

        this.listaParques = [response];
        this.serverMessage = `Registro ${id} cargado correctamente.`;
      },
      error: (err: any) => {
        this.serverMessage = `Error: No se encontró el parque con ID ${id}`;
      }
    });
  }

  update(): void {
    const id = this.parquesForm.get('id')?.value;
    const parqueData = { ...this.parquesForm.value };
    delete parqueData.id;

    parqueData.tipo_mantenimiento = this.extraerIdCodelist(parqueData.tipo_mantenimiento, this.mantenimientos);

    this.apiService.put(`/smartcity/parques/${id}/`, parqueData).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. Registro ID: ${response.id} actualizado.`;
        response.geom_wkt = response.geom_wkt || parqueData.geom;
        this.listaParques = [response];
        this.mapService.getLayerByTitle('Parques WMS')?.getSource().updateParams({"time": Date.now()});
      },
      error: (err: any) => {
        this.serverMessage = `Error al actualizar: ${JSON.stringify(err.error)}`;
      }
    });
  }

  delete(): void {
    const id = this.parquesForm.get('id')?.value;
    this.apiService.delete(`/smartcity/parques/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. Registro ID: ${id} eliminado.`;
        this.clean(); 
        this.mapService.getLayerByTitle('Parques WMS')?.getSource().updateParams({"time": Date.now()});
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/parques/').subscribe({
      next: (response: any) => {
        this.listaParques = response.results || response.data || (Array.isArray(response) ? response : []);
        this.serverMessage = `Select All OK. Hay ${this.listaParques.length} parques registrados.`;
        this.dibujarEnMapa(this.listaParques);
      }
    });
  }

  dibujarEnMapa(lista: any[]): void {
    const vectorLayer = this.mapService.getLayerByTitle('Parques vector');
    const source = vectorLayer?.getSource();
    if (!source) return;

    source.clear(); 
    const wktFormat = new WKT();

    lista.forEach(item => {
      if (item.geom_wkt) { 
        try {
          let feature: any = wktFormat.readFeature(item.geom_wkt, { dataProjection: 'EPSG:25830', featureProjection: 'EPSG:25830' });
          if (feature) {
            feature.setId(item.id);                  
            feature.set('tableName', 'parques');    
            feature.set('attributes', item);        
            source.addFeature(feature);
          }
        } catch (e) {}
      }
    });
  }

  cargarEnFormulario(parqueClicado: any): void {
    this.parquesForm.patchValue(parqueClicado);
    if (parqueClicado.geom_wkt) this.parquesForm.get('geom')?.setValue(parqueClicado.geom_wkt);
    
    if (parqueClicado.tipo_mantenimiento) {
      const obj = this.mantenimientos.find(m => m.id === parqueClicado.tipo_mantenimiento);
      if (obj) this.parquesForm.get('tipo_mantenimiento')?.setValue(obj);
    }
    this.serverMessage = `Registro ID ${parqueClicado.id} cargado listo para actualizar.`;
  }
    
  clean(): void {
    this.parquesForm.reset(); 
    this.parquesForm.patchValue({ tiene_zona_infantil: false }); 
    this.listaParques = []; 
    this.serverMessage = 'Formulario y tabla vaciados.';
  }
}



