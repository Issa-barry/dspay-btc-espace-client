import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleDetailRoutingModule } from './role-detail-routing.module';

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
 import { RoleDetailComponent } from './role-detail.component';
import { TreeDemoRoutingModule } from '../../uikit/tree/treedemo-routing.module';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
 
@NgModule({
  declarations: [RoleDetailComponent],
  imports: [
    CommonModule,
    RoleDetailRoutingModule,
    ToastModule,
    TableModule,
	FileUploadModule,
	FormsModule,
	ButtonModule,
	ToolbarModule,
	RatingModule,
	InputTextModule,
	InputTextareaModule,
	DropdownModule,
	RadioButtonModule,
	InputNumberModule,
	DialogModule, 
    RippleModule,
    AppConfigModule,  
	TreeDemoRoutingModule, 
	TreeModule,
	TreeTableModule,
	ProgressSpinnerModule
  ]
})
export class RoleDetailModule { }
 