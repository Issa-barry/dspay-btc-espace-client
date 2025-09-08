import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturationDetailComponent } from './facturation-detail.component';

describe('FacturationDetailComponent', () => {
  let component: FacturationDetailComponent;
  let fixture: ComponentFixture<FacturationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturationDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FacturationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
