import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturationDetailComponent } from './facturation-detail.component';

const routes: Routes = [{ path: '', component: FacturationDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturationDetailRoutingModule { }
