import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { BuildingFormComponent } from './components/forms/building-form/building-form.component';
import { DrawBuildingComponent } from './components/draw-building/draw-building.component';
import { DrawFlowerComponent } from './components/draw-flower/draw-flower.component';
import { HelpComponent } from './components/help/help.component';

// ¡IMPORTAMOS COMPONENTES!
import { ParquesFormComponent } from './components/forms/parques-form/parques-form.component';
import { ContenedoresFormComponent } from './components/forms/contenedores-form/contenedores-form.component';
import { CarrilesFormComponent } from './components/forms/carriles-form/carriles-form.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'help', component: HelpComponent},
    {path: 'draw_building', component: DrawBuildingComponent},
    {path: 'draw_flower', component: DrawFlowerComponent},
    {path: 'building_form', component: BuildingFormComponent},
    
    // ¡AÑADIMOS RUTAS
    {path: 'parques_form', component: ParquesFormComponent},
    {path: 'contenedores_form', component: ContenedoresFormComponent},
    {path: 'carriles_form', component: CarrilesFormComponent},

    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: '**', component: HomeComponent}
];
