import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgenceDetailComponent } from './agence-detail.component';

const routes: Routes = [{ path: '', component: AgenceDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenceDetailRoutingModule { }
