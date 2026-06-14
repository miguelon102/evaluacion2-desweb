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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Los controles coinciden con tu modelo carril.model.ts
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
    console.log('Enviando (POST) carril:', data);
    this.apiService.post('/smartcity/carriles/', data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        console.log('Respuesta (POST) OK:', response);
      },
      error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
        console.error('Error (POST) al insertar carril:', err);
      }
    });
  }

  selectOne(): void {
    const id = this.carrilesForm.get('id')?.value;
    if (!id) {
      this.serverMessage = 'Error: Escribe un ID para buscar';
      return;
    }

    this.apiService.get(`/smartcity/carriles/${id}/`).subscribe({
      next: (response: any) => {
        this.carrilesForm.patchValue(response);
        this.serverMessage = `Registro ${id} cargado correctamente.`;
      },
      error: (err: any) => {
        this.serverMessage = `Error: No se encontró el carril con ID ${id}`;
        console.error(`Error (GET) al buscar id=${id}:`, err);
      }
    });
  }

  update(): void {
    const id = this.carrilesForm.get('id')?.value;
    const data = this.carrilesForm.value;

    this.apiService.put(`/smartcity/carriles/${id}/`, data).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. Registro ID ${response.id} actualizado.`;
        console.log('Respuesta (PUT) OK:', response);
      },
      error: (err: any) => {
        this.serverMessage = `Error al actualizar: ${err?.message || err}`;
        console.error('Error (PUT) al actualizar carril:', err);
      }
    });
  }

  delete(): void {
    const id = this.carrilesForm.get('id')?.value;

    this.apiService.delete(`/smartcity/carriles/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. Registro ID ${id} eliminado.`;
        this.clean(); // Cumplimos el requisito de vaciar al borrar
      },
      error: (err: any) => {
        this.serverMessage = `Error al borrar: ${err?.message || err}`;
        console.error(`Error (DELETE) id=${id}:`, err);
      }
    });
  }

  selectAll(): void {
    this.apiService.get('/smartcity/carriles/').subscribe({
      next: (response: any) => {
        const cantidad = response.features ? response.features.length : 0;
        this.serverMessage = `Select All OK. Hay ${cantidad} carriles bici registrados.`;
        console.log('Respuesta (GET) selectAll OK, cantidad=', cantidad);
      },
      error: (err: any) => {
        this.serverMessage = `Error al pedir todos: ${err?.message || err}`;
        console.error('Error (GET) selectAll:', err);
      }
    });
  }

  clean(): void {
    this.carrilesForm.reset();
    this.carrilesForm.patchValue({ sentido_unico: false }); // Reseteamos el checkbox explícitamente
    this.serverMessage = 'Formulario vaciado.';
  }
}