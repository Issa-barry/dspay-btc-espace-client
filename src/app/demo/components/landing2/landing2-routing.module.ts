import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing2Component } from './landing2.component';

const routes: Routes = [{ path: '', component: Landing2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Landing2RoutingModule { }
