import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertEditComponent } from './transfert-edit.component';

describe('TransfertEditComponent', () => {
  let component: TransfertEditComponent;
  let fixture: ComponentFixture<TransfertEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfertEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
