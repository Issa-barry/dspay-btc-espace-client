import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactListeComponent } from './contact-liste.component';

describe('ContactListeComponent', () => {
  let component: ContactListeComponent;
  let fixture: ComponentFixture<ContactListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactListeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
