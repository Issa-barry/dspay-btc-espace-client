import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleListeRoutingModule } from './role-liste-routing.module';

import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { PasswordModule } from 'primeng/password';
import { RoleListeComponent } from './role-liste.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
 


@NgModule({
  declarations: [RoleListeComponent],
  imports: [
    CommonModule,
    RoleListeRoutingModule,
    ToastModule,
    TableModule,
		FileUploadModule,
		FormsModule,
		ButtonModule,
		RippleModule,
		ToolbarModule,
		RatingModule,
		InputTextModule,
		InputTextareaModule,
		DropdownModule,
		RadioButtonModule,
		InputNumberModule,
		DialogModule, 
    InputTextModule,
    RippleModule,
    AppConfigModule,
    PasswordModule,
	ProgressSpinnerModule,
  ]
})
export class RoleListeModule { }
