import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { WKT } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-draw-contenedor',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-contenedor.component.html',
  styleUrl: './draw-contenedor.component.scss'
})
export class DrawContenedorComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawContenedor: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'drawContenedorActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.addDrawContenedorInteraction();
    this.disableDrawContenedor();
    this.reloadContenedoresWmsLayer();
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.enableDrawContenedor();
    } else {
      this.disableDrawContenedor();
      this.clearVectorLayer();
      this.reloadContenedoresWmsLayer();
    }
  }

  addDrawContenedorInteraction() {
    var source: VectorSource = this.mapService.getLayerByTitle('Contenedores vector')?.getSource();
    if (source) {
      this.drawContenedor = new Draw({
        source: source,
        type: 'Point'  // Contenedores son puntos
      });
      this.drawContenedor.on('drawend', this.manageDrawEnd);
      this.mapService.map!.addInteraction(this.drawContenedor);
    }
  }

  enableDrawContenedor() {
    this.mapService.disableMapInteractions();
    this.drawContenedor!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawContenedorActivated', {}));
  }

  disableDrawContenedor() {
    this.drawContenedor!.setActive(false);
  }

  clearVectorLayer() {
    this.mapService.getLayerByTitle('Contenedores vector')?.getSource().clear();
  }

  reloadContenedoresWmsLayer() {
    this.mapService.getLayerByTitle('Contenedores WMS')?.getSource().updateParams({ "time": Date.now() });
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);
    this.router.navigate(['/contenedores-form'], { queryParams: { geom: wktRepresentation } });
  }

  ngOnDestroy(): void {
    if (this.drawContenedor) {
      this.mapService.map?.removeInteraction(this.drawContenedor);
    }
  }
}



