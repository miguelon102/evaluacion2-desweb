import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { BuildingFormComponent } from './components/forms/building-form/building-form.component';
import { MapComponent } from './components/map/map.component';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { LogoutFormComponent } from './components/forms/logout-form/logout-form.component';

import { ParquesFormComponent } from './components/forms/parques-form/parques-form.component';
import { ContenedoresFormComponent } from './components/forms/contenedores-form/contenedores-form.component';
import { CarrilesFormComponent } from './components/forms/carriles-form/carriles-form.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'about', component: AboutComponent},
    {path: 'map', component: MapComponent},                    
    {path: 'login-form', component: LoginFormComponent},        
    {path: 'logout-form', component: LogoutFormComponent},      
    {path: 'building-form', component: BuildingFormComponent},  
    {path: 'parques-form', component: ParquesFormComponent},        
    {path: 'contenedores-form', component: ContenedoresFormComponent},
    {path: 'carriles-form', component: CarrilesFormComponent},
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: '**', component: HomeComponent}
];



