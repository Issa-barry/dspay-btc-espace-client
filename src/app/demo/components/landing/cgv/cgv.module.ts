import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CgvRoutingModule } from './cgv-routing.module';
import { CgvComponent } from './cgv.component';
import { ButtonModule } from 'primeng/button';


@NgModule({
  declarations: [
    CgvComponent
  ],
  imports: [
    CommonModule,
    CgvRoutingModule,
    ButtonModule
  ]
})
export class CgvModule { }
