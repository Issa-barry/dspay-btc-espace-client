// src/app/.../agence/agence.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AgenceService } from './agence.service';

describe('AgenceService', () => {
  let service: AgenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AgenceService],
    });
    service = TestBed.inject(AgenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
