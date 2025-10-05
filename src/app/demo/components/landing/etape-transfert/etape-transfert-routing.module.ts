import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EtapeTransfertComponent } from './etape-transfert.component';

const routes: Routes = [{ path: '', component: EtapeTransfertComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtapeTransfertRoutingModule { }
