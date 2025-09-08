import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertEnvoieComponent } from './transfert-envoie.component';

describe('TransfertEnvoieComponent', () => {
  let component: TransfertEnvoieComponent;
  let fixture: ComponentFixture<TransfertEnvoieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertEnvoieComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfertEnvoieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
