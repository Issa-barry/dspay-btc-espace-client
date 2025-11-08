import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', data: {breadcrumb: 'Transfert'}, loadChildren: () => import('./send/send.module').then(m => m.SendModule) },
        // { path: '', loadChildren: () => import('./depot/depot.module').then(m => m.DepotModule) },
        { path: 'depot', loadChildren: () => import('./depot/depot.module').then(m => m.DepotModule) },
        { path: 'send', data: {breadcrumb: 'Transfert'}, loadChildren: () => import('./send/send.module').then(m => m.SendModule) },
        { path: 'dashboard', data: {breadcrumb: 'Dashboard'}, loadChildren: () => import('./ecommerce/ecommerce.dashboard.module').then(m => m.EcommerceDashboardModule) },
        { path: 'dashboard-banking', data: {breadcrumb: 'Banking Dashboard'}, loadChildren: () => import('./banking/banking.dashboard.module').then(m => m.BankingDashboardModule) },
        { path: 'historique', loadChildren: () => import('./historique/historique.module').then(m => m.HistoriqueModule) },
        
        // ✅ Routes partagées pour success et cancel
        { path: 'success', data: {breadcrumb: 'Succès'}, loadChildren: () => import('./success/success.module').then(m => m.SuccessModule) },
        { path: 'cancel', data: {breadcrumb: 'Annulé'}, loadChildren: () => import('./cancel/cancel.module').then(m => m.CancelModule) },
    ])],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }