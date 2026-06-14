import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

// --- NUEVOS IMPORTS ---
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-carriles-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // <-- RouterLink añadido
  templateUrl: './carriles-form.component.html',
  styleUrl: './carriles-form.component.scss'
})
export class CarrilesFormComponent implements OnInit {
  
  carrilesForm!: FormGroup;
  serverMessage: string = '';
  listaCarriles: any[] = []; 

  // --- CONSTRUCTOR UNIFICADO ---
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public mapService: MapService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.carrilesForm = new FormGroup({
      id: new FormControl(''),
      nombre_calle: new FormControl(''),
      longitud_metros: new FormControl(''),
      tipo_pavimento: new FormControl(''),
      sentido_unico: new FormControl(false),
      anyo_construccion: new FormControl(''),
      geom: new FormControl('')
    });

    // --- MAGIA: LEER LA URL ---
    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get('geom');
      if (geom) {
        this.carrilesForm.get('geom')?.setValue(geom);
      }
    });
  }

  insert(): void {
    const data = this.carrilesForm.value;
    delete data.id; 
    this.apiService.post('/smartcity/carriles/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        
        // --- REFRESCA LA CAPA WMS TRAS INSERTAR ---
        this.mapService.getLayerByTitle('Carriles WMS')?.getSource().updateParams({"time": Date.now()});
      },
      error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
      }
    });
  }

  selectOne(): void {
    const id = this.carrilesForm.get('id')?.value;
    if (!id) return;
    this.apiService.get(`/smartcity/carriles/${id}/`).subscribe({
      next: (response: any) => {
        this.carrilesForm.patchValue(response);
        this.serverMessage = `Registro ${id} cargado.`;
      }
    });
  }

  update(): void {
    const id = this.carrilesForm.get('id')?.value;
    const data = this.carrilesForm.value;
    delete data.id; 

    this.apiService.put(`/smartcity/carriles/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. ID ${response.id} actualizado.`;
      }
    });
  }

  delete(): void {
    const id = this.carrilesForm.get('id')?.value;
    this.apiService.delete(`/smartcity/carriles/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. ID ${id} eliminado.`;
        this.clean();
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/carriles/').subscribe({
      next: (response: any) => {
        this.listaCarriles = response.results || response.data || (Array.isArray(response) ? response : []);
        this.serverMessage = `Select All OK. Hay ${this.listaCarriles.length} carriles registrados.`;
      }
    });
  }

  cargarEnFormulario(carrilClicado: any): void {
    this.carrilesForm.patchValue(carrilClicado);
    this.serverMessage = `Carril ID ${carrilClicado.id} cargado.`;
  }

  clean(): void {
    this.carrilesForm.reset();
    this.carrilesForm.patchValue({ sentido_unico: false });
    this.serverMessage = 'Formulario vaciado.';
  }
}



