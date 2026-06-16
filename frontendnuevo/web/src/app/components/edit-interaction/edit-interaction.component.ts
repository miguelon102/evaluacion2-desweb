import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

import Select from 'ol/interaction/Select';
import Modify, { ModifyEvent } from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { WKT } from 'ol/format';

@Component({
  selector: 'app-edit-interaction',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './edit-interaction.component.html',
  styleUrl: './edit-interaction.component.scss'
})
export class EditInteractionComponent implements AfterViewInit, OnDestroy {
  active: boolean = false;
  private editSelect: Select | undefined;
  private modify: Modify | undefined;
  private snaps: Snap[] = [];

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'editActivated') {
        this.active = false;
        this.disable();
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupInteractions();
    this.disable();
  }

  setupInteractions(): void {
    // Escogemos las capas que se pueden editar
    const layers = [
      this.mapService.getLayerByTitle('Parques vector'),
      this.mapService.getLayerByTitle('Contenedores vector'),
      this.mapService.getLayerByTitle('Carriles vector')
    ].filter(l => l !== undefined) as any[];

    // 1. Select "interno" solo para escoger qué feature editar
    this.editSelect = new Select({ layers: layers });
    
    // 2. Modify actúa sobre las features que el Select haya atrapado
    this.modify = new Modify({ features: this.editSelect.getFeatures() });
    this.modify.on('modifyend', this.onModifyEnd);

    this.mapService.map!.addInteraction(this.editSelect);
    this.mapService.map!.addInteraction(this.modify);

    // 3. SNAP
    layers.forEach(layer => {
      const snap = new Snap({ source: layer.getSource() });
      this.mapService.map!.addInteraction(snap);
      this.snaps.push(snap);
    });
  }

  toggle(): void {
    this.active = !this.active;
    if (this.active) {
      this.mapService.disableMapInteractions();
      this.editSelect!.setActive(true);
      this.modify!.setActive(true);
      this.snaps.forEach(s => s.setActive(true));
      this.eventService.emitEvent(new EventModel('editActivated', {}));
    } else {
      this.disable();
    }
  }

  disable(): void {
    this.editSelect?.setActive(false);
    this.modify?.setActive(false);
    this.snaps.forEach(s => s.setActive(false));
  }

  // Se lanza justo al terminar de arrastrar el vértice
  onModifyEnd = (e: ModifyEvent) => {
    const feature = e.features.getArray()[0];
    if (!feature) return;

    const tableName = feature.get('tableName');
    const id = feature.getId();
    
    if (!tableName || id === undefined) return;

    // Extraemos la nueva geometría modificada en formato WKT
    const format = new WKT();
    const newWkt = format.writeGeometry(feature.getGeometry()!, {
      dataProjection: 'EPSG:25830',
      featureProjection: 'EPSG:25830'
    });

    // Actualizamos el feature internamente en el mapa
    const attrs = feature.get('attributes') || {};
    attrs.geom_wkt = newWkt;
    feature.set('attributes', attrs);

    // Limpiamos la selección
    this.editSelect?.getFeatures().clear();
    
    // MAGIA: Navegamos al formulario pasando el ID Y LA NUEVA GEOMETRÍA
    this.router.navigate([`/${tableName}-form`], { queryParams: { id: id, geom: newWkt } });
  }

  ngOnDestroy(): void {
    if (this.editSelect) this.mapService.map?.removeInteraction(this.editSelect);
    if (this.modify) this.mapService.map?.removeInteraction(this.modify);
    this.snaps.forEach(s => this.mapService.map?.removeInteraction(s));
  }
}