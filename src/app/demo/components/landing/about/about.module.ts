import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';

// PrimeNG
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TimelineModule } from 'primeng/timeline';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { RippleModule } from 'primeng/ripple';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    RouterModule,
    AboutRoutingModule,
    // PrimeNG
    CardModule,
    DividerModule,
    ButtonModule,
    TagModule,
    ChipModule,
    TimelineModule,
    AccordionModule,
    AvatarModule,
    AvatarGroupModule,
    RippleModule,
  ],
})
export class AboutModule {}
