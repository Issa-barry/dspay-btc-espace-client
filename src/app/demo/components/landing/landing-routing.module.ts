import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LandingComponent } from './landing.component';
import { HomeComponent } from './home/home.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: LandingComponent,
             children: [
            { path: '', component: HomeComponent },
            { path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule) }

        ]},
    ])],
    exports: [RouterModule]
})
export class LandingRoutingModule { }
