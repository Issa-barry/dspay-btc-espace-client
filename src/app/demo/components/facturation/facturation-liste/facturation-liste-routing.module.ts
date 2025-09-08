import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturationListeComponent } from './facturation-liste.component';

const routes: Routes = [{ path: '', component: FacturationListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturationListeRoutingModule { }
