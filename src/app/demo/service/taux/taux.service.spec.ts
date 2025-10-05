// src/app/.../taux/taux.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TauxService } from './taux.service';

describe('TauxService', () => {
  let service: TauxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TauxService],
    });
    service = TestBed.inject(TauxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
