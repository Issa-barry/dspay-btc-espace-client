import { NgModule, APP_INITIALIZER, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AuthInterceptor } from './interceptors/auth.interceptor';
// import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

import { AuthService } from './demo/service/auth/auth.service';
// import { ServiceWorkerModule } from '@angular/service-worker';
// import { HttpClientXsrfModule } from '@angular/common/http';

export function initAuth(auth: AuthService) {
  // exécuté AVANT le rendu de l'app : hydrate et nettoie le storage si besoin
  return () => auth.initOnStartup();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppLayoutModule,
    ToastModule,
    // HttpClientXsrfModule.withOptions({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   registrationStrategy: 'registerWhenStable:30000'
    // })
  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },

    // APP_INITIALIZER : appelle AuthService.initOnStartup() au démarrage
    { provide: APP_INITIALIZER, useFactory: initAuth, deps: [AuthService], multi: true },

    // Interceptors HTTP
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },

    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
