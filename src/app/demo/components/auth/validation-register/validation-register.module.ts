import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValidationRegisterRoutingModule } from './validation-register-routing.module';
import { ValidationRegisterComponent } from './validation-register.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    ValidationRegisterComponent
  ],
  imports: [
    CommonModule,
    ValidationRegisterRoutingModule,
    ButtonModule
  ]
})
export class ValidationRegisterModule { }
