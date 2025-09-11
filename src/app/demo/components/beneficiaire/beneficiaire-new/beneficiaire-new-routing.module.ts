import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeneficiaireNewComponent } from './beneficiaire-new.component';

const routes: Routes = [{ path: '', component: BeneficiaireNewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BeneficiaireNewRoutingModule { }
