import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
 import { RouterModule } from '@angular/router';
 
  
 import { LandingUiModule } from './ui/landing-ui.module';
import { HomeComponent } from './home/home.component';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';

@NgModule({
    imports: [
        CommonModule,
        LandingRoutingModule,
         RouterModule,
         LandingUiModule,
         AppConfigModule
    ],
    declarations: [
        LandingComponent,
        HomeComponent
        // AnimateEnterDirective,
        // TopbarComponent,
        // LandingSendFormComponent,
        // LandingServiceComponent,
        // LandingPromoComponent,
        // LandingFooterComponent,
        // Card1Component
    ],
})
export class LandingModule {}
