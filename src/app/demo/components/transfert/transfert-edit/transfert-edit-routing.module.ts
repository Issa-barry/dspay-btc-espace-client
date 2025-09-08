import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertEditComponent } from './transfert-edit.component';

const routes: Routes = [{ path: '', component: TransfertEditComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertEditRoutingModule { }
