import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturationListeComponent } from './facturation-liste.component';

describe('FacturationListeComponent', () => {
  let component: FacturationListeComponent;
  let fixture: ComponentFixture<FacturationListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturationListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacturationListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
