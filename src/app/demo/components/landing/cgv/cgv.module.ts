import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CgvRoutingModule } from './cgv-routing.module';
import { CgvComponent } from './cgv.component';


@NgModule({
  declarations: [
    CgvComponent
  ],
  imports: [
    CommonModule,
    CgvRoutingModule
  ]
})
export class CgvModule { }
