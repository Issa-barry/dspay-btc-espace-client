import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';

import { TransfertRetraitRoutingModule } from './transfert-retrait-routing.module';
import { TransfertRetraitComponent } from './transfert-retrait.component';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';


@NgModule({
  declarations: [TransfertRetraitComponent],
  imports: [
    CommonModule,
    TransfertRetraitRoutingModule,
    FormsModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    RippleModule,
    InputGroupModule,
    InputGroupAddonModule,
    DialogModule,
    ToastModule,
    ProgressBarModule,
  ]
})
export class TransfertRetraitModule { }
