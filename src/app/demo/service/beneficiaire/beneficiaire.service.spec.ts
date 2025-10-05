// src/app/.../beneficiaire/beneficiaire.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BeneficiaireService } from './beneficiaire.service';

describe('BeneficiaireService', () => {
  let service: BeneficiaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BeneficiaireService],
    });
    service = TestBed.inject(BeneficiaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
