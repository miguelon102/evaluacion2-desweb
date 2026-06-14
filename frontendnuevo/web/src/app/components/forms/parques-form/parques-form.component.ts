import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { Parque } from '../../../models/parque.model';
import { CommonModule } from '@angular/common';

//NUEVOS IMPORTS
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-parques-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // <-- Añade RouterLink aquí
  templateUrl: './parques-form.component.html',
  styleUrl: './parques-form.component.scss'
})
export class ParquesFormComponent implements OnInit {
    
  // Definimo formulario reactivo
  parquesForm!: FormGroup;
  
  // Variable para mostrar los mensajes del servidor en HTML
  serverMessage: string = '';

  // Array vacio para mostrar info en select all
  listaParques: any[] = [];

  // Inyectamos todos los servicios que necesitamos a la vez
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public mapService: MapService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // Inicializamos los controles del formulario
    //nombres deben coincidir con los campos de la base de datos
    this.parquesForm = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl(''),
      area_hectareas: new FormControl(''),
      tiene_zona_infantil: new FormControl(false),
      horario_cierre: new FormControl(''),
      tipo_mantenimiento: new FormControl(''),
      geom: new FormControl('')
    });
   // --- NUEVO: LEER LA URL ---
    this.activatedRoute.queryParamMap.subscribe(params => {
      const geom = params.get('geom');
      if (geom) {
        this.parquesForm.get('geom')?.setValue(geom);
      }
    });
  }

  // BOTON 1: INSERT (POST)
  insert(): void {
    const parqueData = this.parquesForm.value;
    delete parqueData.id; // Para insertar no enviamos el ID, lo genera la BDD
    
    // Llamamos al ApiService
    console.log('Enviando (POST) parque:', parqueData);
    this.apiService.post('/smartcity/parques/', parqueData).subscribe({
      next: (response: any) => {
        // Mostramos mensaje y ID generado
        this.serverMessage = `Insert OK. Nuevo ID: ${response.id}`;
        console.log('Respuesta (POST) OK:', response);
        this.mapService.getLayerByTitle('Parques WMS')?.getSource().updateParams({"time": Date.now()});
      },
  error: (err: any) => {
        this.serverMessage = `Error al insertar: ${err?.message || err}`;
        console.error('Error (POST) al insertar parque:', err);
      }
    });
  }

  // BOTON 2: SELECT ONE (GET con ID)
  selectOne(): void {
    const id = this.parquesForm.get('id')?.value;
    if (!id) {
      this.serverMessage = 'Error: Escribe un ID para buscar';
      return;
    }

    console.log(`Consultando (GET) parque id=${id}`);
    this.apiService.get(`/smartcity/parques/${id}/`).subscribe({
      next: (response: any) => {
        this.parquesForm.patchValue(response);
        this.serverMessage = `Registro ${id} cargado correctamente.`;
        console.log('Respuesta (GET) OK:', response);
      },
  error: (err: any) => {
        this.serverMessage = `Error: No se encontró el parque con ID ${id}`;
        console.error(`Error (GET) al buscar id=${id}:`, err);
      }
    });
  }

  // BOTON 3: UPDATE (PUT)
  update(): void {
    const id = this.parquesForm.get('id')?.value;
    const parqueData = this.parquesForm.value;

    // Borra el ID del paquete de datos antes de enviarlo
    delete parqueData.id;

    this.apiService.put(`/smartcity/parques/${id}/`, parqueData).subscribe({
      next: (response: any) => {
        this.serverMessage = `Update OK. Registro ID: ${response.id} actualizado.`;
      },
  error: (err: any) => {
        // Ver error de Django si falla la geometría
        this.serverMessage = `Error al actualizar: ${JSON.stringify(err.error)}`;
        console.error('Error (PUT) al actualizar parque:', err);
      }
    });
  }

  // BOTON 4: DELETE
  delete(): void {
    const id = this.parquesForm.get('id')?.value;

    this.apiService.delete(`/smartcity/parques/${id}/`).subscribe({
      next: () => {
        this.serverMessage = `Delete OK. Registro ID: ${id} eliminado.`;
        this.clean(); // vaciamos formulario al borrar
      },
  error: (err: any) => {
        this.serverMessage = `Error al borrar: ${err?.message || err}`;
        console.error(`Error (DELETE) id=${id}:`, err);
      }
    });
  }

  // BOTON 5: SELECT ALL (GET generico)
  selectAll(): void {
    this.apiService.get('/smartcity/parques/').subscribe({
      next: (response: any) => {
        // DETECTOR INTELIGENTE: Extrae el array venga en 'results', en 'data', o directo
        this.listaParques = response.results || response.data || (Array.isArray(response) ? response : []);
        
        const cantidad = this.listaParques.length;
        this.serverMessage = `Select All OK. Hay ${cantidad} parques registrados.`;
        console.log('Respuesta (GET) selectAll OK:', response);
      },
      error: (err: any) => {
        this.serverMessage = `Error al pedir todos: ${err?.message || err}`;
        console.error('Error (GET) selectAll:', err);
      }
    });
  }

  // BOTON EXTRA DE LA TABLA: Para cargar un registro con un clic
  cargarEnFormulario(parqueClicado: any): void {
    this.parquesForm.patchValue(parqueClicado);
    this.serverMessage = `Registro ID ${parqueClicado.id} cargado listo para actualizar o borrar.`;
  }
    

  // BOTON CLEAN
  clean(): void {
    this.parquesForm.reset(); // Vacia todos los campos text boxes
    this.parquesForm.patchValue({ tiene_zona_infantil: false }); // Resetea checkbox
    this.serverMessage = 'Formulario vaciado.';
  }
}