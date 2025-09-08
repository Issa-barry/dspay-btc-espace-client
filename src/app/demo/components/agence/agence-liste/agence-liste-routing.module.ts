import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgenceListeComponent } from './agence-liste.component';

const routes: Routes = [{ path: '', component: AgenceListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenceListeRoutingModule { }
