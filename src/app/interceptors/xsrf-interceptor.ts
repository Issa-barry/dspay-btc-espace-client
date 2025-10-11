// src/app/interceptors/xsrf-interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environements/environment.dev';

function escapeRe(s: string) {
  return s.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
}

function getCookie(name: string): string | null {
  // Recherche du cookie de façon sûre (insensible aux espaces)
  const m = document.cookie.match(
    new RegExp('(?:^|; )' + escapeRe(name) + '=([^;]*)')
  );
  return m ? decodeURIComponent(m[1]) : null;
}

@Injectable()
export class XsrfInterceptor implements HttpInterceptor {
  private webBase = environment.webUrl?.replace(/\/$/, '') || '';
  private apiBase = environment.apiUrl?.replace(/\/$/, '') || '';

  private isBackendUrl(url: string): boolean {
    // Absolu vers web/api
    if (url.startsWith(this.webBase) || url.startsWith(this.apiBase)) {
      return true;
    }
    // Relatif vers back (via proxy dev Angular)
    return (
      url.startsWith('/web/') ||
      url === '/web/login' ||
      url === '/web/logout' ||
      url.startsWith('/api/') ||
      url.startsWith('/sanctum/') ||
      url === '/login' ||
      url === '/logout'
    );
  }

  private isMutating(method: string): boolean {
    return /^(POST|PUT|PATCH|DELETE)$/i.test(method);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne touche qu'aux requêtes destinées au backend
    if (!this.isBackendUrl(req.url)) {
      return next.handle(req);
    }

    const withCreds = true;
    let headers = req.headers;

    // Ajout XSRF uniquement si méthode mutante + cookie dispo
    if (this.isMutating(req.method)) {
      const token = getCookie('XSRF-TOKEN');
      if (token) {
        headers = headers.set('X-XSRF-TOKEN', token);
      }
    }

    // Clone en forçant withCredentials; conserve le reste inchangé
    const cloned = req.clone({ withCredentials: withCreds, headers });
    return next.handle(cloned);
  }
}
