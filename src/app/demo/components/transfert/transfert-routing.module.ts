import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransfertListeComponent } from './transfert-liste/transfert-liste.component';

const routes: Routes = [
                        { path: '', component: TransfertListeComponent }, 
                        { path: 'liste', loadChildren: () => import('./transfert-liste/transfert-liste.module').then(m => m.TransfertListeModule) },
                         { path: 'envoie', loadChildren: () => import('./transfert-envoie/transfert-envoie.module').then(m => m.TransfertEnvoieModule) },
                        { path: 'detail/:id', loadChildren: () => import('./transfert-detail/transfert-detail.module').then(m => m.TransfertDetailModule) },
                        { path: 'edit/:id', loadChildren: () => import('./transfert-edit/transfert-edit.module').then(m => m.TransfertEditModule) },
                        { path: 'envoie2', loadChildren: () => import('./transfert-envoie-2/transfert-envoie-2.module').then(m => m.TransfertEnvoie2Module) },                                     
                      ];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransfertRoutingModule { }
 