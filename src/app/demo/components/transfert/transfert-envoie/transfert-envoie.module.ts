import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransfertEnvoieRoutingModule } from './transfert-envoie-routing.module';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; 
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TransfertEnvoieComponent } from './transfert-envoie.component';


@NgModule({
  declarations: [TransfertEnvoieComponent],
  imports: [
    CommonModule,
    TransfertEnvoieRoutingModule,
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
  ]
})
export class TransfertEnvoieModule { }
