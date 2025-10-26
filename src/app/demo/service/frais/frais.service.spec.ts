// src/app/.../frais/frais.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FraisService } from './frais.service';

describe('FraisService', () => {
  let service: FraisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FraisService],
    });
    service = TestBed.inject(FraisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
