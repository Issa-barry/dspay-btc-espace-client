import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StepActionsComponent } from './step-actions/step-actions.component';
 
@NgModule({
  declarations: [StepActionsComponent],
  imports: [CommonModule, ButtonModule, RippleModule],
  exports: [StepActionsComponent]
})
export class SharedUiModule {}
