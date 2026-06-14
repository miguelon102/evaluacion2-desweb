import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

// --- NUEVOS IMPORTS ---
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-contenedores-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // <-- RouterLink perfectamente inyectado
  templateUrl: './contenedores-form.component.html',
  styleUrl: './contenedores-form.component.scss'
})
export class ContenedoresFormComponent implements OnInit {
  
  contenedoresForm!: FormGroup;
  serverMessage: string = '';
  listaContenedores: any[] = [];

  // --- CONSTRUCTOR UNIFICADO ---
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public mapService: MapService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.contenedoresForm = new FormGroup({
      id: new FormControl(''),
      tipo_residuo: new FormControl(''),
      capacidad_litros: new FormControl(''),
      fecha_ultima_recogida: new FormControl(''),
      estado_conservacion: new FormControl(''),
      barrio: new FormControl(''),
      geom: new FormControl('')
    });

    // --- MAGIA: LEER LA URL ---
    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get('geom');
      if (geom) {
        this.contenedoresForm.get('geom')?.setValue(geom);
      }
    });
  }

  insert(): void {
    const data = this.contenedoresForm.value;
    delete data.id; 
    console.log('Enviando (POST) contenedor:', data);
    this.apiService.post('/smartcity/contenedores/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        
        // --- REFRESCA LA CAPA WMS TRAS INSERTAR ---
        this.mapService.getLayerByTitle('Contenedores WMS')?.getSource().updateParams({"time": Date.now()});
      },
      error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
        console.error('Error (POST) al insertar contenedor:', err);
      }
    });
  }

  selectOne(): void {
    const id = this.contenedoresForm.get('id')?.value;
    if (!id) return;
    this.apiService.get(`/smartcity/contenedores/${id}/`).subscribe({
      next: (response: any) => {
        this.contenedoresForm.patchValue(response);
        this.serverMessage = `Registro ${id} cargado.`;
      }
    });
  }

  update(): void {
    const id = this.contenedoresForm.get('id')?.value;
    const data = this.contenedoresForm.value;
    delete data.id;

    this.apiService.put(`/smartcity/contenedores/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. ID ${response.id} actualizado.`;
      }
    });
  }

  delete(): void {
    const id = this.contenedoresForm.get('id')?.value;
    this.apiService.delete(`/smartcity/contenedores/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. ID ${id} eliminado.`;
        this.clean();
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/contenedores/').subscribe({
      next: (response: any) => {
        this.listaContenedores = response.results || response.data || (Array.isArray(response) ? response : []);
        this.serverMessage = `Select All OK. Hay ${this.listaContenedores.length} contenedores.`;
      }
    });
  }

  cargarEnFormulario(contenedorClicado: any): void {
    this.contenedoresForm.patchValue(contenedorClicado);
    this.serverMessage = `Contenedor ID ${contenedorClicado.id} cargado, listo para actualizar o borrar.`;
  }

  clean(): void {
    this.contenedoresForm.reset();
    this.serverMessage = 'Formulario vaciado.';
  }
}