import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepotRoutingModule } from './depot-routing.module';
import { DepotComponent } from './depot.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DepotComponent
  ],
  imports: [
    CommonModule,
    DepotRoutingModule,
    FormsModule,
  ]
})
export class DepotModule { }
