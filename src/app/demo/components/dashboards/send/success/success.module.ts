import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuccessRoutingModule } from './success-routing.module';
import { SuccessComponent } from './success.component';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonModule } from 'primeng/button';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';


@NgModule({
  declarations: [
    SuccessComponent
  ],
  imports: [
    CommonModule,
    SuccessRoutingModule,
    ToastModule,
    CardModule,
    TagModule,
    SkeletonModule,
    DividerModule,
    FieldsetModule,
    ButtonModule,
    PipeModule,
  ]
})
export class SuccessModule { }
