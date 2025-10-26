import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardGnComponent } from './card-gn.component';
import { ButtonModule } from 'primeng/button';



@NgModule({
  declarations: [CardGnComponent],
  exports: [CardGnComponent],
  imports: [
    CommonModule,
    ButtonModule
  ]
})
export class CardGnModule {

  
 }
