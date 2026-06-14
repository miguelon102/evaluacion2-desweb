
import { Component, OnInit } from '@angular/core';

//To use the template syntax @if, @for, ...
import { CommonModule } from '@angular/common';

//To use forms 
//  Import in the imports on the component the following
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";//angular material must be installed before
import { MatTooltip } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';

//To use the controls in the component
//  Import in the imports on the component the following
import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';


import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { BuildingModel } from '../../../models/building.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TileJSON } from 'ol/source';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule,
    MatCardModule
  ],
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.scss'
})
export class BuildingFormComponent implements OnInit{
  geomInUrl = false;
  l: BuildingModel[]=[]
  serverMessage = '';
  //Form component creation
  id = new FormControl('');
  description =  new FormControl('', [Validators.required]);
  area = new FormControl('', [Validators.required,Validators.minLength(2)]);
  geom = new FormControl('', [Validators.required,Validators.minLength(10)]);

  //Create a form group to eval the data at once
  controlsGroup = new FormGroup({
    id: this.id,
    description: this.description,
    area: this.area,
    geom: this.geom
  })

  //Pay attention to::
  //  - Services must be injected in the constructor
  //  - Services are not imported in the component, in the imports array
  constructor(private apiService:ApiService, private activatedRoute: ActivatedRoute, 
    public router: Router
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      var geom = params.get("geom");
      if (geom){
        this.geom.setValue(geom);
        this.geomInUrl=true
      }
    });
  }

  insert(){
    this.serverMessage='';
    console.log(this.controlsGroup.valid)
    console.log(this.controlsGroup.value)
    this.apiService.post('buildings/buildings_view/insert/',this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        this.selectAll();
      },
      error:error=>{
        console.log(error.description)
      }
    })//subscribe
  }
  select(){
    this.serverMessage='';
    console.log(this.controlsGroup.value)
    if (!this.id.value){
      console.log('Put an id');
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.get('buildings/buildings_view/selectone/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          var d: BuildingModel = response.data[0] as BuildingModel;
          this.setDataInForm(d);
          this.clearList();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })//subscribe
  }

  selectAll(){
    this.serverMessage='';
    this.apiService.get('buildings/buildings_view/selectall/').subscribe({

      next: response => {
        console.log('response',response)
        this.l = response.data as BuildingModel[];
        this.serverMessage=response.message;
      },
      error:error=>{
        console.log(error.description)
      }
    })//subscribe
  }

  deleteRow(){
    this.serverMessage='';
    console.log(this.controlsGroup.value)
    if (!this.id.value){
      console.log('Put an id');
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.post('buildings/buildings_view/delete/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          this.clearForm();
          this.selectAll();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })//subscribe
  }

  update(){
    this.serverMessage='';
    console.log(this.controlsGroup.value)
    if (!this.id.value){
      console.log('Put an id');
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.post('buildings/buildings_view/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          this.selectAll();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })//subscribe
  }

  clearForm(){
    this.controlsGroup.reset();
  }
  clearList(){
    this.l = [];
  }
  setDataInForm(data: BuildingModel){
    this.id.setValue(data.id.toString());
    this.description.setValue(data.description);
    this.area.setValue(data.area.toString());
    this.geom.setValue(data.geom);
  }
  useGeomInUrl(){
      this.activatedRoute.queryParamMap.subscribe(params => {
        this.geom.setValue(params.get("geom"));
    });
  }

}
