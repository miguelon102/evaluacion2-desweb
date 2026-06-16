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
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-carriles-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, MatAutocompleteModule, MatInputModule],
  templateUrl: './carriles-form.component.html',
  styleUrl: './carriles-form.component.scss'
})
export class CarrilesFormComponent implements OnInit {
  
  carrilesForm!: FormGroup;
  serverMessage: string = '';
  listaCarriles: any[] = []; 
  pavimentos: any[] = [];
  pavimentosFiltrados!: Observable<any[]>;

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public mapService: MapService,
    public router: Router,
    private codelistService: CodelistService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carrilesForm = new FormGroup({
      id: new FormControl(''),
      nombre_calle: new FormControl('', [Validators.required, Validators.minLength(3)]),
      longitud_metros: new FormControl('', [Validators.min(0), Validators.pattern('^[0-9]+([.][0-9]+)?$')]),
      tipo_pavimento: new FormControl(''),
      sentido_unico: new FormControl(false),
      anyo_construccion: new FormControl('', [Validators.min(1900), Validators.max(2030), Validators.pattern('^[0-9]{4}$')]),
      geom: new FormControl('', [Validators.required])
    });

    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get('geom');
      if (geom) this.carrilesForm.get('geom')?.setValue(geom);
      
      // NUEVO: si llega un id desde el mapa, lo rellenamos y cargamos el registro
      const id = params.get('id');
      if (id) {
        this.carrilesForm.get('id')?.setValue(id);
        this.selectOne();
      }
    });

    this.codelistService.getTiposPavimento().subscribe((data: any) => {
      this.pavimentos = data;
      this.pavimentosFiltrados = this.carrilesForm.get('tipo_pavimento')!.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrar(value, this.pavimentos))
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

  // TRADUCTOR PARA LA TABLA
  getPavimentoNombre(id: any): string {
    if (!id) return '';
    if (typeof id === 'object' && id.nombre) return id.nombre;
    let cleanId = String(id).split('/').filter(p => p.trim() !== '').pop() || String(id);
    const obj = this.pavimentos.find(p => String(p.id) === cleanId);
    return obj ? obj.nombre : cleanId;
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
    const data = { ...this.carrilesForm.value };
    delete data.id; 
    data.tipo_pavimento = this.extraerIdCodelist(data.tipo_pavimento, this.pavimentos);

    this.apiService.post('/smartcity/carriles/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        this.listaCarriles = [response];
        this.mapService.getLayerByTitle('Carriles WMS')?.getSource().updateParams({"time": Date.now()});
      }
    });
  }

  selectOne(): void {
    const id = this.carrilesForm.get('id')?.value;
    if (!id) return;
    
    this.apiService.get(`/smartcity/carriles/${id}/`).subscribe({
      next: (response: any) => {
        this.carrilesForm.patchValue(response);

        // PRIORIZAR LA URL SOBRE LA BD: Si venimos de editar, la URL tiene la geometría buena
        const geomDesdeUrl = this.activatedRoute.snapshot.queryParamMap.get('geom');
        if (geomDesdeUrl) {
          this.carrilesForm.get('geom')?.setValue(geomDesdeUrl);
        } else if (response.geom_wkt) {
          this.carrilesForm.get('geom')?.setValue(response.geom_wkt);
        }

        if (response.tipo_pavimento) {
          const pObj = this.pavimentos.find(p => p.id === response.tipo_pavimento);
          if (pObj) this.carrilesForm.get('tipo_pavimento')?.setValue(pObj);
        }
        this.listaCarriles = [response];
        this.serverMessage = `Registro ${id} cargado.`;
      }
    });
  }

  update(): void {
    const id = this.carrilesForm.get('id')?.value;
    const data = { ...this.carrilesForm.value };
    delete data.id; 

    data.tipo_pavimento = this.extraerIdCodelist(data.tipo_pavimento, this.pavimentos);

    this.apiService.put(`/smartcity/carriles/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. ID ${response.id} actualizado.`;
        response.geom_wkt = response.geom_wkt || data.geom;
        this.listaCarriles = [response];
        this.mapService.getLayerByTitle('Carriles WMS')?.getSource().updateParams({"time": Date.now()});
      }
    });
  }

  delete(): void {
    const id = this.carrilesForm.get('id')?.value;
    this.apiService.delete(`/smartcity/carriles/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. ID ${id} eliminado.`;
        this.clean();
        this.mapService.getLayerByTitle('Carriles WMS')?.getSource().updateParams({"time": Date.now()});
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/carriles/').subscribe({
      next: (response: any) => {
        this.listaCarriles = response.results || response.data || (Array.isArray(response) ? response : []);
        this.serverMessage = `Select All OK. Hay ${this.listaCarriles.length} carriles registrados.`;
        this.dibujarEnMapa(this.listaCarriles);
      }
    });
  }

  dibujarEnMapa(lista: any[]): void {
    const vectorLayer = this.mapService.getLayerByTitle('Carriles vector');
    const source = vectorLayer?.getSource();
    if (!source) return;

    source.clear(); 
    const wktFormat = new WKT();
    
    lista.forEach(item => {
      if (item.geom_wkt) {
        try {
          const feature = wktFormat.readFeature(item.geom_wkt, { dataProjection: 'EPSG:25830', featureProjection: 'EPSG:25830' });
          feature.setId(item.id);                  
          feature.set('tableName', 'carriles');    
          feature.set('attributes', item);         
          source.addFeature(feature);
        } catch (e) {}
      }
    });
  }

  cargarEnFormulario(carrilClicado: any): void {
    this.carrilesForm.patchValue(carrilClicado);
    if (carrilClicado.geom_wkt) this.carrilesForm.get('geom')?.setValue(carrilClicado.geom_wkt);
    
    if (carrilClicado.tipo_pavimento) {
      const pObj = this.pavimentos.find(p => p.id === carrilClicado.tipo_pavimento);
      if (pObj) this.carrilesForm.get('tipo_pavimento')?.setValue(pObj);
    }
    this.serverMessage = `Carril ID ${carrilClicado.id} cargado listo para actualizar.`;
  }

  clean(): void {
    this.carrilesForm.reset();
    this.carrilesForm.patchValue({ sentido_unico: false });
    this.listaCarriles = [];
    this.serverMessage = 'Formulario y tabla vaciados.';
  }
}




