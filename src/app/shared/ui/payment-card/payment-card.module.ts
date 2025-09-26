import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { PaymentCardComponent } from './payment-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { PipeModule } from 'src/app/demo/pipes/pipe.module';


@NgModule({
  declarations: [PaymentCardComponent],
  exports: [PaymentCardComponent],
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    InputGroupModule,
    InputGroupAddonModule,
    DividerModule,
    BadgeModule,
    PipeModule
  ]

})
export class PaymentCardModule { }
