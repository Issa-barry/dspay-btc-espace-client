import { NgModule, isDevMode } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
// import { ToastModule } from 'primeng/toast';
import { HTTP_INTERCEPTORS, HttpClientXsrfModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { XsrfInterceptor } from './interceptors/xsrf-interceptor';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';
 
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        ToastModule,
        // HttpClientXsrfModule.withOptions({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
        // ServiceWorkerModule.register('ngsw-worker.js', {
        //   enabled: !isDevMode(),
        //   // Register the ServiceWorker as soon as the application is stable
        //   // or after 30 seconds (whichever comes first).
        //   registrationStrategy: 'registerWhenStable:30000'
        // })
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy  },
        // { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },//avant 
        //  { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
        MessageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
 