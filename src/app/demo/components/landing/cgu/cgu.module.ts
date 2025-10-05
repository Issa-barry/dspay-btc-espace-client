import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CguRoutingModule } from './cgu-routing.module';
import { CguComponent } from './cgu.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    CguComponent
  ],
  imports: [
    CommonModule,
    CguRoutingModule,
    ButtonModule
  ]
})
export class CguModule { }
