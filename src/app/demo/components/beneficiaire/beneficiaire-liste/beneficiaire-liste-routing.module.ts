import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeneficiaireListeComponent } from './beneficiaire-liste.component';

const routes: Routes = [{ path: '', component: BeneficiaireListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BeneficiaireListeRoutingModule { }
