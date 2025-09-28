import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environements/environment.dev';
// 🔧 depuis src/app/interceptors/... remonter d'un niveau vers /app puis aller dans /demo/service/token
import { TokenService } from '../demo/service/token/token.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApi = req.url.startsWith(environment.apiUrl);
    let clone = req;

    if (isApi) {
      // cookies Sanctum si backend en pose
      clone = clone.clone({ withCredentials: true });

      // Bearer si token dispo (mode hybride)
      const token = this.tokenService.getToken();
      if (token) {
        clone = clone.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }

    return next.handle(clone);
  }
}
