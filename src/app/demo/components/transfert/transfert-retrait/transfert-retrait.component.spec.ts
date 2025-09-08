import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertRetraitComponent } from './transfert-retrait.component';

describe('TransfertRetraitComponent', () => {
  let component: TransfertRetraitComponent;
  let fixture: ComponentFixture<TransfertRetraitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertRetraitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfertRetraitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
