import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistoriqueRoutingModule } from './historique-routing.module';
import { HistoriqueComponent } from './historique.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';
import { SkeletonModule } from 'primeng/skeleton';


@NgModule({
  declarations: [
    HistoriqueComponent
  ],
  imports: [
    CommonModule,
    HistoriqueRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    PipeModule,
    SkeletonModule
  ]
})
export class HistoriqueModule { }
 