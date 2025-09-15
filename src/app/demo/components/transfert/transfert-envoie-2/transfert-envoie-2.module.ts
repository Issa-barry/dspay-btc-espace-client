import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransfertEnvoie2RoutingModule } from './transfert-envoie-2-routing.module';
import { TransfertEnvoie2Component } from './transfert-envoie-2.component';
import { StepsModule } from 'primeng/steps';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
    declarations: [TransfertEnvoie2Component],
    imports: [
        CommonModule,
        TransfertEnvoie2RoutingModule,
        StepsModule,
        ButtonModule,
        ToastModule,

        FormsModule,
        ReactiveFormsModule,
        CardModule,
        DropdownModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputSwitchModule
    ],
})
export class TransfertEnvoie2Module {}
