import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransfertDetailRoutingModule } from './transfert-detail-routing.module';
import { TransfertDetailComponent } from './transfert-detail.component';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
 
@NgModule({
    declarations: [TransfertDetailComponent],
    imports: [
        CommonModule,
        TransfertDetailRoutingModule,
        ButtonModule,
        RippleModule,
        DialogModule,
        ToastModule,
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
        ConfirmDialogModule,
    ],
})
export class TransfertDetailModule {}
