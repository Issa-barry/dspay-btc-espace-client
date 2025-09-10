import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertEnvoie2Component } from './transfert-envoie-2.component';

const routes: Routes = [{ path: '', component: TransfertEnvoie2Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertEnvoie2RoutingModule { }
