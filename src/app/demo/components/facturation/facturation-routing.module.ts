import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturationListeComponent } from './facturation-liste/facturation-liste.component';

const routes: Routes = [
   { path: '', component: FacturationListeComponent },
   { path: 'detail', loadChildren: () => import('./facturation-detail/facturation-detail.module').then(m => m.FacturationDetailModule) }, 
   { path: 'liste', loadChildren: () => import('./facturation-liste/facturation-liste.module').then(m => m.FacturationListeModule) },
   { path: 'create', loadChildren: () => import('./facturation-create/facturation-create.module').then(m => m.FacturationCreateModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturationRoutingModule { }
