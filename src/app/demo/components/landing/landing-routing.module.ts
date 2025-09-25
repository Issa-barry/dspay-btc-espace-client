import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { HomeComponent } from './home/home.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: LandingComponent,
             children: [
            { path: '', component: HomeComponent },
            { path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule) },
            { path: 'cgu', loadChildren: () => import('./cgu/cgu.module').then(m => m.CguModule) },
            { path: 'cgv', loadChildren: () => import('./cgv/cgv.module').then(m => m.CgvModule) },
            { path: 'etape-transfert', loadChildren: () => import('./etape-transfert/etape-transfert.module').then(m => m.EtapeTransfertModule) },

        ]},
        
    ])],
    exports: [RouterModule]
})
export class LandingRoutingModule { }
