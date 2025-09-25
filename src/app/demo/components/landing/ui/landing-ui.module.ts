// src/app/demo/components/landing/ui/landing-ui.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';

// Pipes custom (money, etc.)
import { PipeModule } from '../../../pipes/pipe.module';
import { TopbarComponent } from './topbar/topbar.component';
import { LandingFooterComponent } from './landing-footer/landing-footer.component';
import { LandingSendFormComponent } from './landing-send-form/landing-send-form.component';
import { LandingServiceComponent } from './landing-service/landing-service.component';
import { LandingPromoComponent } from './landing-promo/landing-promo.component';
import { Card1Component } from './card-1/card-1.component';

// UI components 

@NgModule({
  declarations: [
    TopbarComponent,
    LandingFooterComponent,
    LandingSendFormComponent,
    LandingServiceComponent,
    LandingPromoComponent,
    Card1Component,
  ],
  imports: [
    CommonModule,
    FormsModule,           // ngModel dans SendForm
    RouterModule,          // routerLink dans Card1, Topbar
    StyleClassModule,      // pStyleClass dans Topbar
    // PrimeNG
    ButtonModule,
    DropdownModule,
    DividerModule,
    InputNumberModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    TagModule,
    RippleModule,
    // Pipes (money, phone, etc.)
    PipeModule,
  ],
  exports: [
    TopbarComponent,
    LandingFooterComponent,
    LandingSendFormComponent,
    LandingServiceComponent,
    LandingPromoComponent,
    Card1Component,
  ],
})
export class LandingUiModule {}
