import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '',data: {breadcrumb: 'Transfert'}, loadChildren: () => import('./send/send.module').then(m => m.SendModule) },
        { path: 'send',data: {breadcrumb: 'Transfert'}, loadChildren: () => import('./send/send.module').then(m => m.SendModule) },
        // { path: '', data: {breadcrumb: 'Dashboard'}, loadChildren: () => import('./ecommerce/ecommerce.dashboard.module').then(m => m.EcommerceDashboardModule) },
        { path: 'dashboard', data: {breadcrumb: 'Dashboard'}, loadChildren: () => import('./ecommerce/ecommerce.dashboard.module').then(m => m.EcommerceDashboardModule) },
        { path: 'dashboard-banking', data: {breadcrumb: 'Banking Dashboard'}, loadChildren: () => import('./banking/banking.dashboard.module').then(m => m.BankingDashboardModule) },
    ])],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
  