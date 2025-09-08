import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenceNewComponent } from './agence-new.component';

describe('AgenceNewComponent', () => {
  let component: AgenceNewComponent;
  let fixture: ComponentFixture<AgenceNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgenceNewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgenceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
