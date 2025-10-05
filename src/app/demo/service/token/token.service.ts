import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';

type ApiResponse<T = any> = { success: boolean; message: string; data?: T | null };

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly storageKey = 'access_token';

  private tokenSubject: BehaviorSubject<string | null>;
  public  token$: Observable<string | null>;

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem(this.storageKey);
    const initial = raw && raw !== 'undefined' && raw !== 'null' ? raw : null;
    if (!initial && raw) localStorage.removeItem(this.storageKey); // nettoie valeurs invalides
    this.tokenSubject = new BehaviorSubject<string | null>(initial);
    this.token$ = this.tokenSubject.asObservable();
  }

  /** Enregistre le token (ignore null/undefined/"undefined"/"null") */
  storeToken(token?: string | null): void {
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem(this.storageKey, token);
      this.tokenSubject.next(token);
    } else {
      this.clearToken();
    }
  }

  /** Supprime le token */
  clearToken(): void {
    localStorage.removeItem(this.storageKey);
    this.tokenSubject.next(null);
  }

  /** Renvoie le token courant */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /** Vrai si un token est présent */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Vérifie la validité du token côté API.
   * NB: Le back expose /check-token-header et renvoie { success: true/false, ... }.
   * L’intercepteur ajoute withCredentials et le header Bearer si un token existe.
   */
  verifyToken(): Observable<boolean> {
    if (!this.hasToken()) return of(false);

    return this.http
      .get<ApiResponse>(`${this.apiUrl}/check-token-header`)
      .pipe(
        map(res => !!res?.success),
        catchError(() => {
          this.clearToken();
          return of(false);
        })
      );
  }
}
