import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectInteractionComponent } from './select-interaction.component';

describe('SelectInteractionComponent', () => {
  let component: SelectInteractionComponent;
  let fixture: ComponentFixture<SelectInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectInteractionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
