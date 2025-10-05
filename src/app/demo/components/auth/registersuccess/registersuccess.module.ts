import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterSuccessRoutingModule } from './registersuccess-routing.module';
import { RegisterSuccessComponent } from './registersuccess.component'
import { ButtonModule } from 'primeng/button';

@NgModule({
    imports: [
        CommonModule,
        RegisterSuccessRoutingModule,
        ButtonModule
    ],
    declarations: [RegisterSuccessComponent]
})
export class RegisterSuccessModule {}
