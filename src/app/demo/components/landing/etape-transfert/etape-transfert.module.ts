import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtapeTransfertRoutingModule } from './etape-transfert-routing.module';
import { EtapeTransfertComponent } from './etape-transfert.component';


@NgModule({
  declarations: [
    EtapeTransfertComponent
  ],
  imports: [
    CommonModule,
    EtapeTransfertRoutingModule
  ]
})
export class EtapeTransfertModule { }
