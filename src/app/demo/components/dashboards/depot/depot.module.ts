import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepotRoutingModule } from './depot-routing.module';
import { DepotComponent } from './depot.component';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { SharedUiModule } from 'src/app/shared/ui/shared-ui.module';
import { PaymentCardModule } from 'src/app/shared/ui/payment-card/payment-card.module';


@NgModule({
  declarations: [
    DepotComponent
  ],
  imports: [
    CommonModule,
    DepotRoutingModule,
    FormsModule,
    DialogModule,
    ButtonModule,
     FormsModule,
        ButtonModule,
        RippleModule,
        InputTextModule,
        DropdownModule,
        FileUploadModule,
        InputTextareaModule,
        InputGroupModule,
        InputGroupAddonModule,
        DialogModule,
        ToastModule,
        DividerModule,
         PipeModule,
         ProgressSpinnerModule,
         InputSwitchModule,
         InputNumberModule,
         SharedUiModule,
         PaymentCardModule
  ]
})
export class DepotModule { }
