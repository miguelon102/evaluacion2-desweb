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
  selector: 'app-draw-carril',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-carril.component.html',
  styleUrl: './draw-carril.component.scss'
})
export class DrawCarrilComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawCarril: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type != 'drawCarrilActivated') {
        this.drawMode = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.addDrawCarrilInteraction();
    this.disableDrawCarril();
    this.reloadCarrilesWmsLayer();
  }

  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.enableDrawCarril();
    } else {
      this.disableDrawCarril();
      this.clearVectorLayer();
      this.reloadCarrilesWmsLayer();
    }
  }

  addDrawCarrilInteraction() {
    var source: VectorSource = this.mapService.getLayerByTitle('Carriles vector')?.getSource();
    if (source) {
      this.drawCarril = new Draw({
        source: source,
        type: 'LineString'  // Carriles son lineas
      });
      this.drawCarril.on('drawend', this.manageDrawEnd);
      this.mapService.map!.addInteraction(this.drawCarril);
    }
  }

  enableDrawCarril() {
    this.mapService.disableMapInteractions();
    this.drawCarril!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawCarrilActivated', {}));
  }

  disableDrawCarril() {
    this.drawCarril!.setActive(false);
  }

  clearVectorLayer() {
    this.mapService.getLayerByTitle('Carriles vector')?.getSource().clear();
  }

  reloadCarrilesWmsLayer() {
    this.mapService.getLayerByTitle('Carriles WMS')?.getSource().updateParams({ "time": Date.now() });
  }

  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;
    var wktFormat = new WKT();
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);
    this.router.navigate(['/carriles-form'], { queryParams: { geom: wktRepresentation } });
  }

  ngOnDestroy(): void {
    if (this.drawCarril) {
      this.mapService.map?.removeInteraction(this.drawCarril);
    }
  }
}



