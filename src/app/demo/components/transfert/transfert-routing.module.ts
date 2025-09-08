import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertListeComponent } from './transfert-liste/transfert-liste.component';

const routes: Routes = [
                        { path: '', component: TransfertListeComponent }, 
                        { path: 'liste', loadChildren: () => import('./transfert-liste/transfert-liste.module').then(m => m.TransfertListeModule) },
                        { path: 'retrait', loadChildren: () => import('./transfert-retrait/transfert-retrait.module').then(m => m.TransfertRetraitModule) },
                        { path: 'envoie', loadChildren: () => import('./transfert-envoie/transfert-envoie.module').then(m => m.TransfertEnvoieModule) },
                        { path: 'detail/:id', loadChildren: () => import('./transfert-detail/transfert-detail.module').then(m => m.TransfertDetailModule) },
                        { path: 'edit/:id', loadChildren: () => import('./transfert-edit/transfert-edit.module').then(m => m.TransfertEditModule) },                                     
                      ];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertRoutingModule { }
 