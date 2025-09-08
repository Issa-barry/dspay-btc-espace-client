import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertDetailComponent } from './transfert-detail.component';

const routes: Routes = [{ path: '', component: TransfertDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertDetailRoutingModule { }
