import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertEnvoieComponent } from './transfert-envoie.component';

const routes: Routes = [{ path: '', component: TransfertEnvoieComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertEnvoieRoutingModule { }
