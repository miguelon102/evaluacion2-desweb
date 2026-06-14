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
  selector: 'app-draw-parque',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-parque.component.html',
  styleUrl: './draw-parque.component.scss'
})
export class DrawParqueComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawParque: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'drawParqueActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.addDrawParqueInteraction();
    this.disableDrawParque();
    this.reloadParquesWmsLayer();
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.enableDrawParque();
    } else {
      this.disableDrawParque();
      this.clearVectorLayer();
      this.reloadParquesWmsLayer();
    }
  }

  addDrawParqueInteraction() {
    var source: VectorSource = this.mapService.getLayerByTitle('Parques vector')?.getSource();
    if (source) {
      this.drawParque = new Draw({
        source: source,
        type: 'Polygon'  // Los parques son polígonos
      });
      this.drawParque.on('drawend', this.manageDrawEnd);
      this.mapService.map!.addInteraction(this.drawParque);
    } else {
      console.error("Error: Parques vector layer not found");
    }
  }

  enableDrawParque() {
    this.mapService.disableMapInteractions();
    this.drawParque!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawParqueActivated', {}));
  }

  disableDrawParque() {
    this.drawParque!.setActive(false);
  }

  clearVectorLayer() {
    this.mapService.getLayerByTitle('Parques vector')?.getSource().clear();
  }

  reloadParquesWmsLayer() {
    this.mapService.getLayerByTitle('Parques WMS')?.getSource().updateParams({ "time": Date.now() });
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);
    this.router.navigate(['/parques-form'], { queryParams: { geom: wktRepresentation } });
  }

  ngOnDestroy(): void {
    if (this.drawParque) {
      this.mapService.map?.removeInteraction(this.drawParque);
    }
  }
}



