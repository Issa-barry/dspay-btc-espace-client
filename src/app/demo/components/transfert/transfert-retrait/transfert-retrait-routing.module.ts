import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertRetraitComponent } from './transfert-retrait.component';

const routes: Routes = [{ path: '', component: TransfertRetraitComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertRetraitRoutingModule { }
