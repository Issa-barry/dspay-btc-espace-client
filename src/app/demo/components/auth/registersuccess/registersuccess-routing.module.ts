import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegisterSuccessComponent } from './registersuccess.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RegisterSuccessComponent }
    ])],
    exports: [RouterModule]
})
export class RegisterSuccessRoutingModule {}
