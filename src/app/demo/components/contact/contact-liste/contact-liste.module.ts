import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactListeRoutingModule } from './contact-liste-routing.module';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext'; 
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { NewPasswordRoutingModule } from '../../auth/newpassword/newpassword-routing.module';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { PasswordModule } from 'primeng/password';
import { ContactListeComponent } from './contact-liste.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';


@NgModule({
  declarations: [ContactListeComponent],
  imports: [
    CommonModule,
    ContactListeRoutingModule,
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
        NewPasswordRoutingModule,
        InputTextModule,
        RippleModule,
        AppConfigModule,
        PasswordModule,
        ProgressSpinnerModule,
        SkeletonModule,
  ]
})
export class ContactListeModule { }
 