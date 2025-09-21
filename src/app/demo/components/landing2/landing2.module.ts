import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
  import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
 import { InputTextModule } from 'primeng/inputtext';

import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PipeModule } from '../../pipes/pipe.module';

import { Landing2RoutingModule } from './landing2-routing.module';
import { Landing2Component } from './landing2.component';
import { AnimateEnterDirective } from '../landing/animateenter.directive';


@NgModule({
  declarations: [
    Landing2Component,
    AnimateEnterDirective
  ],
  imports: [
    CommonModule,
    Landing2RoutingModule,
     CommonModule,
    ButtonModule,
    RouterModule,
            StyleClassModule,
            AppConfigModule,
        InputTextModule, 
    
            FormsModule,
        TableModule,
        RatingModule,
        SliderModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule, 
        ProgressBarModule,
        ToastModule,
            InputNumberModule,
            InputSwitchModule,PipeModule
  ]
})
export class Landing2Module { }
