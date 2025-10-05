// src/app/.../paiement/paiement.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PaiementService } from './paiement.service';

describe('PaiementService', () => {
  let service: PaiementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaiementService],
    });
    service = TestBed.inject(PaiementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
