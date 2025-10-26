import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertListeComponent } from './transfert-liste.component';

const routes: Routes = [{ path: '',data: {breadcrumb: 'Historique'}, component: TransfertListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertListeRoutingModule { }
