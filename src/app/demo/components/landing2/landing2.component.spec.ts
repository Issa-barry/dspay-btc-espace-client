import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Landing2Component } from './landing2.component';
import { AuthService } from 'src/app/demo/service/auth/auth.service'; // ajuste le chemin

describe('Landing2Component', () => {
  let component: Landing2Component;
  let fixture: ComponentFixture<Landing2Component>;

  const authSpy = jasmine.createSpyObj('AuthService', [
    'isAuthenticated',
    'isloged',
    'isLoggedIn',
    'login',
    'logout',
    'getToken',
    'getUser',
    'hasRole',
  ]);
  authSpy.isAuthenticated.and.returnValue(true); // ou of(true) si c’est un Observable
  authSpy.isloged.and.returnValue(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Landing2Component],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
