import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleListeComponent } from './role-liste.component';

describe('RoleListeComponent', () => {
  let component: RoleListeComponent;
  let fixture: ComponentFixture<RoleListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoleListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
