import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrilesFormComponent } from './carriles-form.component';

describe('CarrilesFormComponent', () => {
  let component: CarrilesFormComponent;
  let fixture: ComponentFixture<CarrilesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrilesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrilesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
