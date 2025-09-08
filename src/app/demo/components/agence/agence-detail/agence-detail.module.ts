import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgenceDetailRoutingModule } from './agence-detail-routing.module';
import { AgenceDetailComponent } from './agence-detail.component';


@NgModule({
  declarations: [
    AgenceDetailComponent
  ],
  imports: [
    CommonModule,
    AgenceDetailRoutingModule
  ]
})
export class AgenceDetailModule { }
