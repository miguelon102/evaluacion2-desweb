import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenedoresFormComponent } from './contenedores-form.component';

describe('ContenedoresFormComponent', () => {
  let component: ContenedoresFormComponent;
  let fixture: ComponentFixture<ContenedoresFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenedoresFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenedoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
