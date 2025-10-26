import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGnComponent } from './card-gn.component';

describe('CardGnComponent', () => {
  let component: CardGnComponent;
  let fixture: ComponentFixture<CardGnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardGnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
