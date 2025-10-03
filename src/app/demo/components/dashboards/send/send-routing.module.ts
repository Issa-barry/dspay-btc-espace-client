import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendComponent } from './send.component';

const routes: Routes = [{ path: '', component: SendComponent }, { path: 'success', loadChildren: () => import('./success/success.module').then(m => m.SuccessModule) }, { path: 'cancel', loadChildren: () => import('./cancel/cancel.module').then(m => m.CancelModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendRoutingModule { }
