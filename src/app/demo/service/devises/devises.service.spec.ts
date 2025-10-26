// src/app/.../devises/devises.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DevisesService } from './devises.service';

describe('DevisesService', () => {
  let service: DevisesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DevisesService],
    });
    service = TestBed.inject(DevisesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
