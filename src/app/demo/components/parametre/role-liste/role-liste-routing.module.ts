import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleListeComponent } from './role-liste.component';

const routes: Routes = [{ path: '', component: RoleListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleListeRoutingModule { }
