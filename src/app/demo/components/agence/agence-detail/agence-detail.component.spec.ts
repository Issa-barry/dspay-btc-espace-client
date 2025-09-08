import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenceDetailComponent } from './agence-detail.component';

describe('AgenceDetailComponent', () => {
  let component: AgenceDetailComponent;
  let fixture: ComponentFixture<AgenceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgenceDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
