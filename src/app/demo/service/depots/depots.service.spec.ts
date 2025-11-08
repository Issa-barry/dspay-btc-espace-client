// src/app/.../depots/depots.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DepotsService } from './depots.service';

describe('DepotsService', () => {
  let service: DepotsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DepotsService],
    });
    service = TestBed.inject(DepotsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
