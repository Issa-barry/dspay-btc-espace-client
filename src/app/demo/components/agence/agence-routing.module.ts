import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgenceListeComponent } from './agence-liste/agence-liste.component';

const routes: Routes = [
   { path: '', component: AgenceListeComponent }, 
   { path: 'new-agence', loadChildren: () => import('./agence-new/agence-new.module').then(m => m.AgenceNewModule) },
   { path: 'agence-liste', loadChildren: () => import('./agence-liste/agence-liste.module').then(m => m.AgenceListeModule) },
   { path: 'agence-edit/:id', loadChildren: () => import('./agence-edit/agence-edit.module').then(m => m.AgenceEditModule) },
   { path: 'agence-detail/:id', loadChildren: () => import('./agence-detail/agence-detail.module').then(m => m.AgenceDetailModule) }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenceRoutingModule { }
