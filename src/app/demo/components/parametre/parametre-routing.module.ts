import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralComponent } from './general/general.component';
import { permissionGuard } from '../../guards/permission/permission.guard';


const routes: Routes = [
  { path: '', data: {breadcrumb: 'Parametre'}, component: GeneralComponent }, 
  { path: 'general', data: {breadcrumb: 'Général'}, loadChildren: () => import('./general/general.module').then(m => m.GeneralModule) },
  { path: 'role-detail/:id',data: {breadcrumb: 'Paramétre > Role > détail'}, loadChildren: () => import('./role-detail/role-detail.module').then(m => m.RoleDetailModule) },
  { 
    path: 'role-liste', 
    data: { breadcrumb: 'Paramétre/Role/Liste', permission: 'afficher Roles' }, 
    loadChildren: () => import('./role-liste/role-liste.module').then(m => m.RoleListeModule),
    canActivate: [permissionGuard], // Ajout du guard
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametreRoutingModule { }
 