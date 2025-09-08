import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAffecterAgenceComponent } from './contact-affecter-agence.component';

describe('ContactAffecterAgenceComponent', () => {
  let component: ContactAffecterAgenceComponent;
  let fixture: ComponentFixture<ContactAffecterAgenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAffecterAgenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactAffecterAgenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
