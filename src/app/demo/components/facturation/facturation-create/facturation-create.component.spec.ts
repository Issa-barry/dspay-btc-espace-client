import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturationCreateComponent } from './facturation-create.component';

describe('FacturationCreateComponent', () => {
  let component: FacturationCreateComponent;
  let fixture: ComponentFixture<FacturationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturationCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacturationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
