import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';


import { SendRoutingModule } from './send-routing.module';
import { SendComponent } from './send.component';
import { DialogModule } from 'primeng/dialog';
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
    SendComponent
  ],
  imports: [
    CommonModule,
    SendRoutingModule,
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
export class SendModule { }
