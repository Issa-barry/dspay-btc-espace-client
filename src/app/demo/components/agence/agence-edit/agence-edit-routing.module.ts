import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgenceEditComponent } from './agence-edit.component';

const routes: Routes = [{ path: '', component: AgenceEditComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenceEditRoutingModule { }
