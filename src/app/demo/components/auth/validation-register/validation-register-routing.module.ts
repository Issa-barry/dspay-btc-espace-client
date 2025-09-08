import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidationRegisterComponent } from './validation-register.component';

const routes: Routes = [{ path: '', component: ValidationRegisterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidationRegisterRoutingModule { }
