import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaireListeComponent } from './beneficiaire-liste.component';

describe('BeneficiaireListeComponent', () => {
  let component: BeneficiaireListeComponent;
  let fixture: ComponentFixture<BeneficiaireListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BeneficiaireListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeneficiaireListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
