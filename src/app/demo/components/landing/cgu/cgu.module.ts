import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CguRoutingModule } from './cgu-routing.module';
import { CguComponent } from './cgu.component';


@NgModule({
  declarations: [
    CguComponent
  ],
  imports: [
    CommonModule,
    CguRoutingModule
  ]
})
export class CguModule { }
