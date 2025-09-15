import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'; import { BeneficiaireListeComponent } from './beneficiaire-liste/beneficiaire-liste.component';

const routes: Routes = [{ path: '', component: BeneficiaireListeComponent }, { path: 'beneficiaire-liste', loadChildren: () => import('./beneficiaire-liste/beneficiaire-liste.module').then(m => m.BeneficiaireListeModule) }, { path: 'beneficiaire-new', loadChildren: () => import('./beneficiaire-new/beneficiaire-new.module').then(m => m.BeneficiaireNewModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BeneficiaireRoutingModule { }
