import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactListeComponent } from './contact-liste.component';

const routes: Routes = [{ path: '', component: ContactListeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactListeRoutingModule { }
