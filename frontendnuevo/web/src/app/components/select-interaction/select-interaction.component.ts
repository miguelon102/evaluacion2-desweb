import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import Select from 'ol/interaction/Select';
import { SelectEvent } from 'ol/interaction/Select';

@Component({
  selector: 'app-select-interaction',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './select-interaction.component.html',
  styleUrl: './select-interaction.component.scss'
})
export class SelectInteractionComponent implements AfterViewInit, OnDestroy {
  active: boolean = false;
  selectInteraction: Select | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'selectActivated') {
        this.active = false;
        this.disable();
      }
    });
  }

  ngAfterViewInit(): void {
    this.addSelectInteraction();
    this.disable();
  }

  addSelectInteraction(): void {
    const layers = [
      this.mapService.getLayerByTitle('Parques vector'),
      this.mapService.getLayerByTitle('Contenedores vector'),
      this.mapService.getLayerByTitle('Carriles vector')
    ].filter(l => l !== undefined) as any[];

    this.selectInteraction = new Select({ layers: layers });
    this.selectInteraction.on('select', this.onSelect);
    this.mapService.map!.addInteraction(this.selectInteraction);
    this.mapService.browseSelectInteraction = this.selectInteraction;
  }

  toggle(): void {
    this.active = !this.active;
    if (this.active) {
      this.mapService.disableMapInteractions(); 
      this.selectInteraction!.setActive(true);
      this.eventService.emitEvent(new EventModel('selectActivated', {}));
    } else {
      this.disable();
    }
  }

  disable(): void {
    this.selectInteraction?.setActive(false);
  }

  // funcion ejecutada al seleccionar feature en el mapa (se extrae featureID y nombre capa, y se usa servicio router de angular para redirigir al formulario correspondiente y abrir el select one)
  onSelect = (e: SelectEvent) => {
    const feature = e.selected[0];
    if (!feature) return;
    const tableName = feature.get('tableName');
    const id = feature.getId();
    if (tableName && id !== undefined) {
      // Magia: Redirige al formulario pasándole el ID
      this.router.navigate([`/${tableName}-form`], { queryParams: { id: id } });
    }
    this.selectInteraction?.getFeatures().clear();
  }

  ngOnDestroy(): void {
    if (this.selectInteraction) {
      this.mapService.map?.removeInteraction(this.selectInteraction);
    }
  }
}



