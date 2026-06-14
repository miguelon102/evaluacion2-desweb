import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carriles-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './carriles-form.component.html',
  styleUrl: './carriles-form.component.scss'
})
export class CarrilesFormComponent implements OnInit {
  
  carrilesForm!: FormGroup;
  serverMessage: string = '';
  listaCarriles: any[] = []; // Variable para la tabla

  constructor(private apiService: ApiService) {}

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
  }

  insert(): void {
    const data = this.carrilesForm.value;
    delete data.id; 
    this.apiService.post('/smartcity/carriles/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
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
    delete data.id; // BLINDAJE

    this.apiService.put(`/smartcity/carriles/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. ID ${response.id} actualizado.`;
      },
      error: (err: any) => {
        this.serverMessage = `Error al actualizar: ${JSON.stringify(err.error)}`;
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