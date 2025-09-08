import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenceListeComponent } from './agence-liste.component';

describe('AgenceListeComponent', () => {
  let component: AgenceListeComponent;
  let fixture: ComponentFixture<AgenceListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgenceListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgenceListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
