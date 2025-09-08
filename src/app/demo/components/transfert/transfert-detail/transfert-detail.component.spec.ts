import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertDetailComponent } from './transfert-detail.component';

describe('TransfertDetailComponent', () => {
  let component: TransfertDetailComponent;
  let fixture: ComponentFixture<TransfertDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfertDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 
