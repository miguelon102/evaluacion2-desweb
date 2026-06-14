import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contenedores-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contenedores-form.component.html',
  styleUrl: './contenedores-form.component.scss'
})
export class ContenedoresFormComponent implements OnInit {
  
  contenedoresForm!: FormGroup;
  serverMessage: string = '';

  // Variable para guardar los datos de la tabla
  listaContenedores: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // controles coinciden con modelo contenedor.model.ts
    this.contenedoresForm = new FormGroup({
      id: new FormControl(''),
      tipo_residuo: new FormControl(''),
      capacidad_litros: new FormControl(''),
      fecha_ultima_recogida: new FormControl(''),
      estado_conservacion: new FormControl(''),
      barrio: new FormControl(''),
      geom: new FormControl('')
    });
  }

  insert(): void {
    const data = this.contenedoresForm.value;
    delete data.id; 
    console.log('Enviando (POST) contenedor:', data);
    this.apiService.post('/smartcity/contenedores/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        console.log('Respuesta (POST) OK:', response);
      },
      error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
        console.error('Error (POST) al insertar contenedor:', err);
      }
    });
  }

  selectOne(): void {
    const id = this.contenedoresForm.get('id')?.value;
    if (!id) {
      this.serverMessage = 'Error: Escribe un ID';
      return;
    }

    this.apiService.get(`/smartcity/contenedores/${id}/`).subscribe({
      next: (response: any) => {
        this.contenedoresForm.patchValue(response);
        this.serverMessage = `Registro ${id} cargado.`;
      },
      error: (err: any) => {
        this.serverMessage = `Error: No encontrado`;
        console.error(`Error (GET) al buscar id=${id}:`, err);
      }
    });
  }

  update(): void {
    const id = this.contenedoresForm.get('id')?.value;
    const data = this.contenedoresForm.value;

    // Blindaje del ID para que Django no lo rechace
    delete data.id;

    this.apiService.put(`/smartcity/contenedores/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. ID ${response.id} actualizado.`;
        console.log('Respuesta (PUT) OK:', response);
      },
      error: (err: any) => {
        this.serverMessage = `Error al actualizar: ${JSON.stringify(err.error)}`;
        console.error('Error (PUT) al actualizar contenedor:', err);
      }
    });
  }

  delete(): void {
    const id = this.contenedoresForm.get('id')?.value;

    this.apiService.delete(`/smartcity/contenedores/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. ID ${id} eliminado.`;
        this.clean(); // Vaciamos
      },
      error: (err: any) => {
        this.serverMessage = `Error al borrar: ${err?.message || err}`;
        console.error(`Error (DELETE) id=${id}:`, err);
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/contenedores/').subscribe({
      next: (response: any) => {
        // DETECTOR INTELIGENTE
        this.listaContenedores = response.results || response.data || (Array.isArray(response) ? response : []);
        
        const cantidad = this.listaContenedores.length;
        this.serverMessage = `Select All OK. Hay ${cantidad} contenedores.`;
        console.log('Respuesta (GET) selectAll OK, cantidad=', cantidad);
      },
      error: (err: any) => {
        this.serverMessage = `Error al pedir todos: ${err?.message || err}`;
        console.error('Error (GET) selectAll:', err);
      }
    });
  }

  // FUNCIÓN EXTRA PARA LA TABLA
  cargarEnFormulario(contenedorClicado: any): void {
    this.contenedoresForm.patchValue(contenedorClicado);
    this.serverMessage = `Contenedor ID ${contenedorClicado.id} cargado, listo para actualizar o borrar.`;
  }

  clean(): void {
    this.contenedoresForm.reset();
    this.serverMessage = 'Formulario vaciado.';
  }
}