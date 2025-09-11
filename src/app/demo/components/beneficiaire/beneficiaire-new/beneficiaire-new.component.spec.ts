import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaireNewComponent } from './beneficiaire-new.component';

describe('BeneficiaireNewComponent', () => {
  let component: BeneficiaireNewComponent;
  let fixture: ComponentFixture<BeneficiaireNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BeneficiaireNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeneficiaireNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
