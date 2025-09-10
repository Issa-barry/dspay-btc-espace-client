import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertEnvoie2Component } from './transfert-envoie-2.component';

describe('TransfertEnvoie2Component', () => {
  let component: TransfertEnvoie2Component;
  let fixture: ComponentFixture<TransfertEnvoie2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransfertEnvoie2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfertEnvoie2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
