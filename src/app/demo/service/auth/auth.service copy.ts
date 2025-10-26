import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap, finalize  } from 'rxjs/operators';
import { environment } from 'src/environements/environment.dev';
import { Router } from '@angular/router';
import { TokenService } from '../token/token.service';
import { Contact } from '../../models/contact';

const httpOption = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // Ces entêtes CORS ne sont pas nécessaires côté client, tu peux les retirer :
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT,PATCH',
  }),
};

export interface CreateClientDto {
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}
export interface ApiResponse<T = any> { success: boolean; message: string; data?: T | null; }
export interface ClientCreated { id: number; email: string; phone: string; }
export interface LoginResponse { user: Contact; }

@Injectable({ providedIn: 'root' })
export class AuthServiceCOPIE {
  private apiUrl = `${environment.apiUrl}`;   // ex: http://localhost:8000/api
  private webUrl = `${environment.webUrl}`;   // ex: http://localhost:8000

  /** Etat utilisateur */
  private currentUserSubject = new BehaviorSubject<Contact | null>(null);
  public  currentUser$ = this.currentUserSubject.asObservable();
  private userId = '';

  constructor(
    public router: Router,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  /** valeur courante (synchrone) */
  public get currentUserValue(): Contact | null {
    return this.currentUserSubject.value;
  }

  // -------------------- Helpers privés --------------------

  private setCurrentUser(user: Contact) {
    this.userId = String(user.id);
    this.currentUserSubject.next(user);
  }

  private extractUser(resp: ApiResponse<LoginResponse>): Contact | undefined {
    return resp?.data?.user;
  }

  /** Lit un cookie (pour XSRF-TOKEN) */
  private readCookie(name: string): string | null {
    const m = document.cookie.match(
      new RegExp('(^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
    );
    return m ? decodeURIComponent(m[2]) : null;
  }

  /** Options HTTP avec withCredentials et header X-XSRF-TOKEN si dispo */
/** Options HTTP avec withCredentials et header X-XSRF-TOKEN si dispo */
private buildOptions(extraHeaders?: Record<string, string>) {
  // On lit le cookie XSRF-TOKEN (déposé par /sanctum/csrf-cookie)
  const token = this.readCookie('XSRF-TOKEN');

  let headers = new HttpHeaders({
    'Content-Type': 'application/json',
    // ⚠️ Ne pas inclure Access-Control-* ici, ils sont gérés côté backend
  });

  // ✅ Ajoute le header CSRF si présent
  if (token) {
    headers = headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
  }

  // ✅ Fusion des en-têtes additionnels si fournis
  if (extraHeaders) {
    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers = headers.set(key, value);
    });
  }

  // ✅ Activation des cookies (essentiel pour Laravel Sanctum)
  return {
    headers,
    withCredentials: true,
  };
}

  /** Doit être appelé AVANT toute requête stateful (login/logout/post/put/...) */
  // private getCsrfCookie(): Observable<any> {
  //   return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true });
  // }

  getCsrfCookie(): Observable<any> {
  return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true })
    .pipe(tap(() => {
      console.log('XSRF-TOKEN:', this.readCookie('XSRF-TOKEN'));
      console.log('All cookies:', document.cookie);
    }));
}

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      if (error.status === 422) {
        if (error.error?.data && typeof error.error.data === 'object') {
          errorMessage = Object.keys(error.error.data)
            .map((k) =>
              Array.isArray(error.error.data[k])
                ? error.error.data[k].join(' ')
                : String(error.error.data[k])
            )
            .join(' ');
        } else if (error.error?.errors) {
          const errs = error.error.errors;
          errorMessage = Object.keys(errs).map((k) => errs[k].join(' ')).join(' ');
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      } else if (error.status === 401) {
        errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
      } else if (error.status === 419) {
        errorMessage = 'Session/CSRF expiré. Veuillez réessayer.';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur';
      } else {
        errorMessage = `Erreur serveur ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // -------------------- API public --------------------

  /**
   * Login via session Laravel (cookies)
   * 1) récupère XSRF-TOKEN
   * 2) poste /login avec X-XSRF-TOKEN + withCredentials
   */


  login(credentials: { email: string; password: string }): Observable<ApiResponse<LoginResponse>> {
    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<ApiResponse<LoginResponse>>(
          `${this.webUrl}/web/login`,
          credentials,
          this.buildOptions()
        )
      ),
      tap((res) => {
        const user = this.extractUser(res);
        if (user && typeof user === 'object' && 'id' in user) {
          this.setCurrentUser(user);
        } else {
          this.currentUserSubject.next(null);
        }
      }),
      catchError(this.handleError)
    );
  }

 

  /**
   * Logout: détruit la session Laravel côté serveur
   * On nettoie localement même en cas d’erreur (419/401)
   */

    // Helper : nettoyage local garanti
private localSignOut(): void {
  this.currentUserSubject.next(null);
  this.userId = '';
  try {
    localStorage.clear();
    sessionStorage.clear();
   indexedDB?.databases?.().then(dbs => dbs?.forEach(db => indexedDB.deleteDatabase(db.name!)));
  } catch {}
  this.router.navigate(['/auth/login']);
}



 /** Déconnexion : on nettoie localement même si Laravel renvoie une erreur */
logout(): Observable<void> {
  return this.getCsrfCookie().pipe(
    // Si csrf échoue, on continue quand même
    catchError(() => of(null)),
    switchMap(() =>
      this.http.post<ApiResponse>(`${this.webUrl}/logout`, {}, this.buildOptions())
        // On ignore toute erreur du POST /logout
        .pipe(catchError(() => of(null)))
    ),
    // Dans tous les cas, on se déconnecte côté front
    finalize(() => this.localSignOut()),
    map(() => void 0)
  );
}

 


  /** Inscription client (protégée CSRF) */
  register(payload: Contact): Observable<Contact> {
    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post<ApiResponse<Contact>>(
          `${this.webUrl}/users/clients/create`,
          payload,
          this.buildOptions()
        )
      ),
      map((res) => res.data as Contact),
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie l'authentification via cookie session
   * Appelle /users/me pour valider la session et récupérer l'utilisateur
   */
  // isAuthenticated(): Observable<boolean> {
  //   return this.getMe().pipe(
  //     map((user) => !!user),
  //     catchError(() => of(true))
  //   );
  // }

  
  isAuthenticated(): boolean {
    return false; // !!this.tokenService.getToken();
  }


  getMe(): Contact | null { return this.currentUserValue; }
  setUserId(id: string) { this.userId = id; }
  getMe(): string { return this.userId; }
}
