import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapeTransfertComponent } from './etape-transfert.component';

describe('EtapeTransfertComponent', () => {
  let component: EtapeTransfertComponent;
  let fixture: ComponentFixture<EtapeTransfertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtapeTransfertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtapeTransfertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
