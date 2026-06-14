import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParquesFormComponent } from './parques-form.component';

describe('ParquesFormComponent', () => {
  let component: ParquesFormComponent;
  let fixture: ComponentFixture<ParquesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParquesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParquesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
