import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TopbarComponent } from './topbar.component';
import { SidebarModule } from 'primeng/sidebar';



@NgModule({
  declarations: [TopbarComponent],
  exports: [TopbarComponent],
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    SidebarModule
  ]
})
export class TopbarModule { }
