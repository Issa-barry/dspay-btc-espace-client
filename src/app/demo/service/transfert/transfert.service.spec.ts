// src/app/.../transfert/transfert.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TransfertService } from './transfert.service';

describe('TransfertService', () => {
  let service: TransfertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransfertService],
    });
    service = TestBed.inject(TransfertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
