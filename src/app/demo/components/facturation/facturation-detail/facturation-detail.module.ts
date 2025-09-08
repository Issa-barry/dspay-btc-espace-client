import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturationDetailRoutingModule } from './facturation-detail-routing.module';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FacturationDetailComponent } from './facturation-detail.component';
import { SplitButtonModule } from 'primeng/splitbutton';


@NgModule({
  declarations: [FacturationDetailComponent],
  imports: [
    CommonModule,
    FacturationDetailRoutingModule,
    ButtonModule,
    ToolbarModule,
    SplitButtonModule,
  ]
})
export class FacturationDetailModule { }
