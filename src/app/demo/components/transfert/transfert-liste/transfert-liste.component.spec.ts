import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertListeComponent } from './transfert-liste.component';

describe('TransfertListeComponent', () => {
  let component: TransfertListeComponent;
  let fixture: ComponentFixture<TransfertListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfertListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
