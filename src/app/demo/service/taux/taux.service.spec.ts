import { TestBed } from '@angular/core/testing';

import { TauxService } from './taux.service';

describe('TauxService', () => {
  let service: TauxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TauxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
